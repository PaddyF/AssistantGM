import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import PlayerStatCard from '../components/PlayerStatCard';
import GameCard from '../components/GameCard';
import * as NBAApi from '../services/nbaApi';

const DashboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myTeamPlayers, setMyTeamPlayers] = useState([]);
  const [trendingPlayers, setTrendingPlayers] = useState([]);
  const [todaysGames, setTodaysGames] = useState([]);
  const [previousGames, setPreviousGames] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [playerTimeRanges, setPlayerTimeRanges] = useState({});

  // Example player IDs - In a real app, these would come from user's team
  const myTeamPlayerIds = [237, 115]; // LeBron James and Stephen Curry
  const trendingPlayerIds = [3547396]; // Anthony Edwards

  const fetchPlayerData = async (playerIds) => {
    try {
      const playerData = await Promise.all(
        playerIds.map(async (id) => {
          const playerInfo = await NBAApi.getPlayerInfo(id);
          const playerStats = await NBAApi.getPlayerStats(id);
          return NBAApi.formatPlayerStats(playerStats, playerInfo);
        })
      );
      return playerData;
    } catch (error) {
      console.error('Error fetching player data:', error);
      setError('Failed to load player data. Please try again later.');
      return [];
    }
  };

  const fetchGames = async () => {
    try {
      // Fetch today's games
      const today = new Date();
      const todayGames = await NBAApi.getGamesByDate(today);
      setTodaysGames(todayGames);

      // Fetch previous 3 days of games
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const previousGamesData = await NBAApi.getGamesInDateRange(threeDaysAgo, yesterday);
      setPreviousGames(previousGamesData);
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to load games. Please try again later.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchPlayerData(myTeamPlayerIds).then(setMyTeamPlayers),
        fetchPlayerData(trendingPlayerIds).then(setTrendingPlayers),
        fetchGames(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTimeRangeChange = async (playerId, timeRange) => {
    try {
      setLoading(true);
      const playerStats = await NBAApi.getPlayerStats(playerId, timeRange);
      setMyTeamPlayers(current => 
        current.map(player => 
          player.id === playerId 
            ? { ...player, stats: playerStats.averages }
            : player
        )
      );
      setPlayerTimeRanges(current => ({
        ...current,
        [playerId]: timeRange
      }));
    } catch (error) {
      console.error('Error updating player stats:', error);
      setError('Failed to update player statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Team</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.email}>Welcome, {auth.currentUser?.email}</Text>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Games</Text>
        {todaysGames.length > 0 ? (
          todaysGames.map((game, index) => (
            <GameCard key={index} game={game} />
          ))
        ) : (
          <Text style={styles.noGamesText}>No games scheduled for today</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Previous Games</Text>
        {previousGames.length > 0 ? (
          previousGames.map((game, index) => (
            <GameCard key={index} game={game} />
          ))
        ) : (
          <Text style={styles.noGamesText}>No previous games available</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Players</Text>
        {myTeamPlayers.map((player, index) => (
          <PlayerStatCard 
            key={index} 
            player={player}
            onTimeRangeChange={handleTimeRangeChange}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Players</Text>
        {trendingPlayers.map((player, index) => (
          <PlayerStatCard key={index} player={player} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#1a1a1a',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  noGamesText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
});

export default DashboardScreen; 