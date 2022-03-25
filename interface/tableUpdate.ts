type RecordsUpdate = {
  // when action = 'add' , add only SearchProps => add into array from changeIndex ,
  // when action = 'remove, add all SearchProps[] from min index of changed =>  add into array from changeIndex
  tableRows: SearchProps[];
  action: 'add' | 'remove' | null;
  changeIndex?: number;
};
