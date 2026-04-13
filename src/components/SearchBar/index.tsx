import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { APP_COLORS } from '../../config/theme';

type SearchBarProps = {
  onSearch: (query: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <Searchbar
      placeholder="Buscar por nome ou número"
      onChangeText={handleSearch}
      value={searchQuery}
      style={styles.searchBar}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    margin: 5,
    elevation: 5,
    borderRadius: 1,
    backgroundColor: APP_COLORS.surface,
    shadowColor: APP_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
});

export default SearchBar;