import sys
import json
from nba_api.stats.static import players

def search_players(query):
    all_players = players.get_players()
    query = query.lower()
    
    # Search by name
    results = [
        player for player in all_players
        if query in player['full_name'].lower()
    ]
    
    # Format results
    formatted_results = [{
        'id': player['id'],
        'firstName': player['first_name'],
        'lastName': player['last_name'],
        'fullName': player['full_name'],
        'isActive': player['is_active']
    } for player in results]
    
    return formatted_results[:20]  # Limit to 20 results

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Search query is required'}))
        sys.exit(1)
        
    query = sys.argv[1]
    
    try:
        results = search_players(query)
        print(json.dumps(results))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main() 