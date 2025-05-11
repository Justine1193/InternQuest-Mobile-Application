export const filterData = (data, searchQuery, filters) => {
  if (!Array.isArray(data)) return [];
  
  return data.filter((item) => {
    // Search query matching
    const matchesSearch = Object.entries(item).some(([key, value]) => {
      if (!value) return false;
      
      // Handle object values
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'object' ? 
              Object.values(v).some(val => 
                val && val.toString().toLowerCase().includes(searchQuery.toLowerCase())
              ) :
              v && v.toString().toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return Object.values(value).some(val => 
          val && val.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Apply all filters
    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      const itemValue = item[key];
      if (!itemValue) return false;

      if (Array.isArray(itemValue)) {
        return itemValue.some(v => {
          if (typeof v === 'object' && v !== null) {
            return Object.values(v).some(val => 
              val && val.toString().toLowerCase().includes(value.toLowerCase())
            );
          }
          return v && v.toString().toLowerCase().includes(value.toLowerCase());
        });
      }
      
      if (typeof itemValue === 'object' && itemValue !== null) {
        return Object.values(itemValue).some(val => 
          val && val.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
      
      if (typeof itemValue === 'boolean') {
        return itemValue === (value === 'true');
      }
      
      return itemValue.toString().toLowerCase().includes(value.toLowerCase());
    });

    return matchesSearch && matchesFilters;
  });
};

export const paginateData = (data, currentPage, itemsPerPage) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  return data.slice(indexOfFirstItem, indexOfLastItem);
};

export const handleSelection = (id, selectedItems, setSelectedItems) => {
  setSelectedItems((prev) =>
    prev.includes(id)
      ? prev.filter((item) => item !== id)
      : [...prev, id]
  );
};

export const handleSelectAll = (e, data, setSelectedItems) => {
  if (e.target.checked) {
    setSelectedItems(data.map((item) => item.id));
  } else {
    setSelectedItems([]);
  }
};

// Helper function to safely render object values
export const renderObjectValue = (value) => {
  if (!value) return '';
  
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(v => renderObjectValue(v)).join(', ');
    }
    return Object.values(value).join(', ');
  }
  
  return value.toString();
}; 