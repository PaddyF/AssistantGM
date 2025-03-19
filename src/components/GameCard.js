import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GameCard = ({ game }) => {
  // Format the game time
  const formatGameTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format the score with proper spacing
  const formatScore = (score) => score === 0 ? '-' : score;

  return (
    <View style={styles.card}>
      <View style={styles.gameHeader}>
        <Text style={styles.gameTime}>
          {game.status === 'Final' ? 'Final' : formatGameTime(game.start_time)}
        </Text>
      </View>

      <View style={styles.teamContainer}>
        {/* Home Team */}
        <View style={styles.teamRow}>
          <Text style={[styles.teamName, game.home_team_score > game.visitor_team_score && styles.winningTeam]}>
            {game.home_team.abbreviation}
          </Text>
          <Text style={[styles.score, game.home_team_score > game.visitor_team_score && styles.winningTeam]}>
            {formatScore(game.home_team_score)}
          </Text>
        </View>

        {/* Visitor Team */}
        <View style={styles.teamRow}>
          <Text style={[styles.teamName, game.visitor_team_score > game.home_team_score && styles.winningTeam]}>
            {game.visitor_team.abbreviation}
          </Text>
          <Text style={[styles.score, game.visitor_team_score > game.home_team_score && styles.winningTeam]}>
            {formatScore(game.visitor_team_score)}
          </Text>
        </View>
      </View>

      {game.status !== 'Final' && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{game.status}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  gameHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  gameTime: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  teamContainer: {
    marginVertical: 4,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  score: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  winningTeam: {
    fontWeight: '700',
    color: '#007AFF',
  },
  statusContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default GameCard; 