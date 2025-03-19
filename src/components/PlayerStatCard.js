import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const TimeRangeSelector = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { label: 'Season', value: 'season' },
    { label: 'Month', value: 'month' },
    { label: '2 Weeks', value: '2weeks' },
    { label: 'Week', value: 'week' }
  ];

  return (
    <View style={styles.timeRangeContainer}>
      {ranges.map(range => (
        <TouchableOpacity
          key={range.value}
          style={[
            styles.timeRangeButton,
            selectedRange === range.value && styles.timeRangeButtonSelected
          ]}
          onPress={() => onRangeChange(range.value)}
        >
          <Text style={[
            styles.timeRangeText,
            selectedRange === range.value && styles.timeRangeTextSelected
          ]}>
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const PlayerStatCard = ({ player, onTimeRangeChange }) => {
  const [timeRange, setTimeRange] = useState('season');

  const handleRangeChange = (range) => {
    setTimeRange(range);
    onTimeRangeChange(player.id, range);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image 
          source={{ uri: player.imageUrl || 'https://via.placeholder.com/150' }} 
          style={styles.playerImage}
          testID="player-image"
        />
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.teamPosition}>{player.team} - {player.position}</Text>
        </View>
        {player.injury && (
          <View style={styles.injuryTag}>
            <Text style={styles.injuryText}>{player.injury}</Text>
          </View>
        )}
      </View>

      <TimeRangeSelector
        selectedRange={timeRange}
        onRangeChange={handleRangeChange}
      />
      
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>PTS</Text>
            <Text style={styles.statValue}>{player.stats.points}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>REB</Text>
            <Text style={styles.statValue}>{player.stats.rebounds}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>AST</Text>
            <Text style={styles.statValue}>{player.stats.assists}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>STL</Text>
            <Text style={styles.statValue}>{player.stats.steals}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>BLK</Text>
            <Text style={styles.statValue}>{player.stats.blocks}</Text>
          </View>
        </View>
        
        <View style={[styles.statsRow, styles.statsRowBorder]}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>FG%</Text>
            <Text style={styles.statValue}>{player.stats.fgPercent}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>FT%</Text>
            <Text style={styles.statValue}>{player.stats.ftPercent}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>3PM</Text>
            <Text style={styles.statValue}>{player.stats.threePM}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TO</Text>
            <Text style={styles.statValue}>{player.stats.turnovers}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>GP</Text>
            <Text style={styles.statValue}>{player.stats.gamesPlayed}</Text>
          </View>
        </View>
      </View>

      {player.trend && (
        <View style={[styles.trendIndicator, 
          player.trend === 'up' ? styles.trendUp : styles.trendDown]}>
          <Text style={styles.trendText}>
            {player.trend === 'up' ? '↑' : '↓'} {player.trendValue}
          </Text>
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
    marginVertical: 8,
    marginHorizontal: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  teamPosition: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  injuryTag: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  injuryText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    paddingTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statsRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  trendIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendUp: {
    backgroundColor: '#E8F5E9',
  },
  trendDown: {
    backgroundColor: '#FFE5E5',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  timeRangeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  timeRangeText: {
    fontSize: 12,
    color: '#666',
  },
  timeRangeTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});

export default PlayerStatCard; 