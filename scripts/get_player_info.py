import sys
import json
from nba_api.stats.endpoints import commonplayerinfo

def process_player_data(data):
    if not data['resultSets'][0]['rowSet']:
        raise ValueError('Player not found')
        
    player_info = dict(zip(
        data['resultSets'][0]['headers'],
        data['resultSets'][0]['rowSet'][0]
    ))
    
    return {
        'id': player_info['PERSON_ID'],
        'firstName': player_info['FIRST_NAME'],
        'lastName': player_info['LAST_NAME'],
        'teamId': player_info['TEAM_ID'],
        'teamName': player_info['TEAM_NAME'],
        'jersey': player_info['JERSEY'],
        'position': player_info['POSITION'],
        'height': player_info['HEIGHT'],
        'weight': player_info['WEIGHT'],
        'birthdate': player_info['BIRTHDATE'],
        'experience': player_info['SEASON_EXP'],
        'country': player_info['COUNTRY'],
        'lastAffiliation': player_info['LAST_AFFILIATION'],
        'draft': {
            'year': player_info['DRAFT_YEAR'],
            'round': player_info['DRAFT_ROUND'],
            'number': player_info['DRAFT_NUMBER']
        }
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Player ID is required'}))
        sys.exit(1)
        
    player_id = sys.argv[1]
    
    try:
        player_info = commonplayerinfo.CommonPlayerInfo(player_id=player_id).get_dict()
        result = process_player_data(player_info)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main() 