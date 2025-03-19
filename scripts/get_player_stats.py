import sys
import json
from datetime import datetime, timedelta
from nba_api.stats.endpoints import playergamelog
from nba_api.stats.library.parameters import SeasonAll

def get_date_range(time_range):
    end_date = datetime.now()
    start_date = end_date
    
    if time_range == 'week':
        start_date = end_date - timedelta(days=7)
    elif time_range == '2weeks':
        start_date = end_date - timedelta(days=14)
    elif time_range == 'month':
        start_date = end_date - timedelta(days=30)
    
    return start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')

def process_game_stats(game):
    return {
        'date': game['GAME_DATE'],
        'points': game['PTS'],
        'rebounds': game['REB'],
        'assists': game['AST'],
        'steals': game['STL'],
        'blocks': game['BLK'],
        'fgPercent': round(game['FG_PCT'] * 100, 1) if game['FG_PCT'] is not None else None,
        'ftPercent': round(game['FT_PCT'] * 100, 1) if game['FT_PCT'] is not None else None,
        'threePM': game['FG3M'],
        'turnovers': game['TOV'],
        'minutes': game['MIN']
    }

def calculate_averages(games):
    if not games:
        return None
        
    totals = {}
    for game in games:
        for key, value in game.items():
            if key != 'date' and value is not None:
                totals[key] = totals.get(key, 0) + float(value)
    
    return {key: round(total / len(games), 1) for key, total in totals.items()}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Player ID is required'}))
        sys.exit(1)
        
    player_id = sys.argv[1]
    time_range = sys.argv[2] if len(sys.argv) > 2 else 'season'
    
    try:
        # Get game logs
        if time_range == 'season':
            game_logs = playergamelog.PlayerGameLog(player_id=player_id).get_dict()
        else:
            start_date, end_date = get_date_range(time_range)
            game_logs = playergamelog.PlayerGameLog(
                player_id=player_id,
                date_from_nullable=start_date,
                date_to_nullable=end_date
            ).get_dict()
        
        # Process games
        games = [process_game_stats(game) for game in game_logs['resultSets'][0]['rowSet']]
        averages = calculate_averages(games)
        
        result = {
            'games': games,
            'averages': averages,
            'gamesPlayed': len(games)
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main() 