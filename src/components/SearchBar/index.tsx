import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';

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
    margin: 16,
    elevation: 4,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

export default SearchBar;