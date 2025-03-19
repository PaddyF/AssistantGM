import sys
import json
from datetime import datetime, timedelta
from nba_api.stats.endpoints import leaguegamefinder

def format_game(game):
    return {
        'gameId': game['GAME_ID'],
        'date': game['GAME_DATE'],
        'matchup': game['MATCHUP'],
        'homeTeam': {
            'id': game['TEAM_ID'] if game['MATCHUP'].split('@')[0] == game['TEAM_NAME'] else None,
            'name': game['TEAM_NAME'] if game['MATCHUP'].split('@')[0] == game['TEAM_NAME'] else None,
            'score': game['PTS'] if game['MATCHUP'].split('@')[0] == game['TEAM_NAME'] else None
        },
        'awayTeam': {
            'id': game['TEAM_ID'] if game['MATCHUP'].split('@')[1].strip() == game['TEAM_NAME'] else None,
            'name': game['TEAM_NAME'] if game['MATCHUP'].split('@')[1].strip() == game['TEAM_NAME'] else None,
            'score': game['PTS'] if game['MATCHUP'].split('@')[1].strip() == game['TEAM_NAME'] else None
        },
        'status': 'Final'  # NBA API only returns completed games
    }

def get_games_by_date(date_str):
    games = leaguegamefinder.LeagueGameFinder(
        date_from_nullable=date_str,
        date_to_nullable=date_str
    ).get_dict()
    
    if not games['resultSets'][0]['rowSet']:
        return []
        
    # Group games by game ID to combine home and away team info
    game_dict = {}
    for game in games['resultSets'][0]['rowSet']:
        game_info = dict(zip(games['resultSets'][0]['headers'], game))
        game_id = game_info['GAME_ID']
        
        if game_id not in game_dict:
            game_dict[game_id] = format_game(game_info)
        else:
            # Update the other team's info
            if '@' in game_info['MATCHUP']:
                if game_info['MATCHUP'].split('@')[0] == game_info['TEAM_NAME']:
                    game_dict[game_id]['homeTeam'].update({
                        'id': game_info['TEAM_ID'],
                        'name': game_info['TEAM_NAME'],
                        'score': game_info['PTS']
                    })
                else:
                    game_dict[game_id]['awayTeam'].update({
                        'id': game_info['TEAM_ID'],
                        'name': game_info['TEAM_NAME'],
                        'score': game_info['PTS']
                    })
    
    return list(game_dict.values())

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Date or date range is required'}))
        sys.exit(1)
        
    try:
        if sys.argv[1] == 'date':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'Date is required'}))
                sys.exit(1)
            games = get_games_by_date(sys.argv[2])
            
        elif sys.argv[1] == 'range':
            if len(sys.argv) < 4:
                print(json.dumps({'error': 'Start and end dates are required'}))
                sys.exit(1)
            start_date = datetime.strptime(sys.argv[2], '%Y-%m-%d')
            end_date = datetime.strptime(sys.argv[3], '%Y-%m-%d')
            
            games = []
            current_date = start_date
            while current_date <= end_date:
                date_str = current_date.strftime('%Y-%m-%d')
                games.extend(get_games_by_date(date_str))
                current_date = current_date + timedelta(days=1)
        
        else:
            print(json.dumps({'error': 'Invalid command. Use "date" or "range"'}))
            sys.exit(1)
            
        print(json.dumps(games))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main() 