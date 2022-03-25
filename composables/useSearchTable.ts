const pageSize = 10;
const maxPages = 5;

// export const useTableData = () => useState('tableData', () => useSearchTable().tableData);
export const useSearchTable = () => {
  // State
  const recordsUpdate = useState('recordsUpdate', (): RecordsUpdate => {
    // records update flow
    return {
      tableRows: [],
      action: null,
    };
  });
  const currentPage = useState('currentPage', (): number => 1);
  const tableRows = useState('tableRows', (): SearchProps[] => []);
  const tableData = useState('tableData', (): TableData => paginate(tableRows.value, currentPage.value));

  // Functions
  const updateTableData = () => (tableData.value = paginate(tableRows.value, currentPage.value));
  const setPage = (pageIndex) => {
    currentPage.value = pageIndex;
    updateTableData();
  };

  const addRow = async (place: google.maps.places.PlaceResult): Promise<number> => {
    if (!place.geometry) throw new Error(`Cannot get the geometry`);

    let lat = place.geometry.location.lat() || null;
    let lng = place.geometry.location.lng() || null;
    let time = await useTimeZoneAPI({ lat, lng });
    let addressComponents = getAddressComponents(place.address_components);

    let recordLength = tableRows.value.length;

    let tableProps = {
      index: recordLength + 1,
      searchDate: new Date().toLocaleString(),
      timeZone: null,
      localTime: null,
      lat: lat,
      lng: lng,
      locality: null,
      state: null,
      country: null,
      address: null,
      fullAddress: place.formatted_address || null,
      postcode: null,
    };
    if (addressComponents) {
      tableProps.address = addressComponents.address;
      tableProps.locality = addressComponents.locality;
      tableProps.state = addressComponents.state;
      tableProps.country = addressComponents.country;
      tableProps.postcode = addressComponents.postcode;
    }
    if (time) {
      tableProps.timeZone = `${time.timeZoneId} (${time.timeZoneName})`;
      tableProps.localTime = time.localTime;
    }
    recordsUpdate.value = {
      tableRows: [tableProps],
      action: 'add',
    };
    tableRows.value.unshift(tableProps);
    updateTableData();
    return tableProps.index;
  };

  const removeRow = (indexArray: number[]) => {
    // *** use temp to store the changed value , avoid somewhere listening to the records.value (trigger mulitple times)
    // tableRows.value.length - item = 2 length - (index =1) = 1
    const itemIndex = indexArray.map((item) => tableRows.value.length - item);
    let temp = [...tableRows.value];
    const maxIndex = Math.max(...itemIndex) + 1;
    const tableRowsAppend = tableRows.value.slice(maxIndex, temp.length);
    itemIndex.forEach((index) => (temp[index] = null));

    const tempNoNull = temp.slice(0, maxIndex).filter((value) => value);
    const recordLength = tableRowsAppend.length + tempNoNull.length;
    temp = tempNoNull.map((record, index) => {
      record.index = recordLength - index;
      return record;
    });

    recordsUpdate.value = {
      tableRows: temp,
      action: 'remove',
      changeIndex: Math.min(...indexArray) - 1, //2-1 = 1
    };

    tableRows.value = [...temp, ...tableRowsAppend];
    updateTableData();
  };

  return {
    records: readonly(recordsUpdate),
    tableData: readonly(tableData),
    currentPage: readonly(currentPage),
    addRow,
    removeRow,
    setPage,
  };
};

const getAddressComponents = (addressComponents: google.maps.GeocoderAddressComponent[]) => {
  if (!addressComponents) {
    return null;
  }

  let data = {
    address: '',
    locality: '',
    state: '',
    country: '',
    postcode: '',
  };
  for (const component of addressComponents) {
    const componentType = component.types[0];
    switch (componentType) {
      case 'street_number': {
        data.address = `${component.long_name} ${data.address}`;
        break;
      }

      case 'route': {
        data.address += component.short_name;
        break;
      }

      case 'postal_code': {
        data.postcode = `${component.long_name}${data.postcode}`;
        break;
      }

      case 'postal_code_suffix': {
        data.postcode = `${data.postcode}-${component.long_name}`;
        break;
      }

      case 'locality':
        data.locality = component.long_name;
        break;

      case 'administrative_area_level_1': {
        data.state = component.short_name;
        break;
      }

      case 'country':
        data.country = component.long_name;
        break;
    }
  }
  return data;
};

const paginate = (records: SearchProps[], currentPage: number = 1): TableData => {
  let totalItems = records.length;
  // calculate total pages
  let totalPages = Math.ceil(totalItems / pageSize);

  // ensure current page isn't out of range
  if (currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  let startPage: number, endPage: number;
  if (totalPages <= maxPages) {
    // total pages less than max so show all pages
    startPage = 1;
    endPage = totalPages;
  } else {
    // total pages more than max so calculate start and end pages
    let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
    let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrentPage) {
      // current page near the start
      startPage = 1;
      endPage = maxPages;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      // current page near the end
      startPage = totalPages - maxPages + 1;
      endPage = totalPages;
    } else {
      // current page somewhere in the middle
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  // calculate start and end item indexes
  let startIndex = (currentPage - 1) * pageSize;
  let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

  // create an array of pages to ng-repeat in the pager control
  let pages = Array.from(Array(endPage + 1 - startPage).keys()).map((i) => startPage + i);

  // return object with all pager properties required by the view
  return {
    searchProps: records,
    totalItems,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    pages,
  };
};
