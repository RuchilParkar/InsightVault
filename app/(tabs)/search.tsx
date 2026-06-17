import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SearchBar } from '../../src/components/common/SearchBar';
import { FilterBar } from '../../src/components/common/FilterBar';
import { KnowledgeCard } from '../../src/components/common/KnowledgeCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { searchKnowledge } from '../../src/database/search';
import { useSQLiteContext } from 'expo-sqlite';
import { Search as SearchIcon, Clock, Trash2 } from 'lucide-react-native';
import { KnowledgeItem } from '../../src/types/schemas';
import * as Crypto from 'expo-crypto';

const SMART_FILTERS = ['All', 'Favorites', 'Recently Added', 'Development', 'Design', 'AI', 'Productivity', 'Startup'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [results, setResults] = useState<KnowledgeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<{id: string, query: string}[]>([]);
  const db = useSQLiteContext();

  // Load search history
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await db.getAllAsync<{id: string, query: string}>(
        `SELECT id, query FROM search_history ORDER BY created_at DESC LIMIT 10`
      );
      setSearchHistory(history);
    } catch (e) {
      console.error(e);
    }
  };

  const clearHistory = async () => {
    await db.runAsync(`DELETE FROM search_history`);
    setSearchHistory([]);
  };

  const saveSearchToHistory = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    try {
      // Don't save duplicates
      await db.runAsync(`DELETE FROM search_history WHERE query = ?`, [searchQuery]);
      await db.runAsync(
        `INSERT INTO search_history (id, query, created_at) VALUES (?, ?, ?)`,
        [Crypto.randomUUID(), searchQuery, Date.now()]
      );
      loadHistory();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim() === '' && activeFilter === 'All') {
        setResults([]);
        return;
      }
      
      setIsSearching(true);
      const res = await searchKnowledge(db, query, activeFilter);
      setResults(res);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeFilter, db]);

  const handleSearchSubmit = () => {
    if (query.trim()) {
      saveSearchToHistory(query.trim());
    }
  };

  return (
    <View className="flex-1 bg-background pt-12 px-4">
      <Text className="text-textPrimary font-outfit text-3xl font-bold mb-4">Search</Text>
      
      <SearchBar 
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
      />
      
      <View className="mt-4">
        <FilterBar 
          filters={SMART_FILTERS} 
          activeFilter={activeFilter} 
          onSelectFilter={setActiveFilter} 
        />
      </View>
      
      <ScrollView className="flex-1 mt-2" showsVerticalScrollIndicator={false}>
        {query.trim() === '' && activeFilter === 'All' ? (
          <View>
            <View className="flex-row items-center justify-between mb-4 mt-2">
              <View className="flex-row items-center">
                <Clock color="#94A3B8" size={16} />
                <Text className="text-textSecondary font-inter text-sm font-medium uppercase tracking-wider ml-2">
                  Recent Searches
                </Text>
              </View>
              {searchHistory.length > 0 && (
                <TouchableOpacity onPress={clearHistory}>
                  <Text className="text-accent font-inter text-sm">Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {searchHistory.length === 0 ? (
              <EmptyState 
                title="No recent searches" 
                description="Start typing to explore your knowledge base."
                icon={<SearchIcon color="#4F46E5" size={32} />}
              />
            ) : (
              <View>
                {searchHistory.map((historyItem) => (
                  <TouchableOpacity 
                    key={historyItem.id}
                    className="flex-row items-center py-3 border-b border-border/50"
                    onPress={() => setQuery(historyItem.query)}
                  >
                    <SearchIcon color="#94A3B8" size={16} />
                    <Text className="text-textPrimary font-inter text-base ml-3">
                      {historyItem.query}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : results.length === 0 && !isSearching ? (
          <EmptyState 
            title="No results found" 
            description="Try adjusting your filters or search terms."
            icon={<SearchIcon color="#94A3B8" size={32} />}
          />
        ) : (
          <View className="pb-24">
            <Text className="text-textSecondary font-inter text-sm mb-4">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </Text>
            {results.map((item, index) => (
              <KnowledgeCard key={item.id} item={item} index={index} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
