<template>
    <thead>
        <tr class="head-tr">
            <th v-for="(value,key) in headerData" v-if="value.areShown === true" :key='key'>
                <div class='table-grid' :class='{"table-grid-one-row": value.search === false || value.search === undefined}'>
                    <div :class='{"th-action" : key=="actions" ? true: false}' style='marginBottom:10px; display: flex; align-items: center; white-space: nowrap;'>
                        <span style='marginRight:5px;'>{{value.label}}</span>
                        <SortButton :config='config'
                                    v-if='(config.columns[key].order === true) && (fieldsWithSorting.includes(key))'
                                    :columnName='value.label'
                                    :itemsPerPage='itemsPerPage'>
                        </SortButton>
                    </div>
                    <Search
                        :config='config'
                        v-if='config.columns[key].search === true && fieldsWithSearch.includes(key)'
                        :searchColumnName='value.label'
                        :allInputObjects='allInputObjects'
                        :requestForData='requestForData'
                        :resetField = resetField
                        :itemsPerPage='itemsPerPage'
                    >
                    </Search>
                </div>
            </th>
        </tr>
    </thead>
</template>

<script>
import Search from './Search';
import SortButton from './SortButton';
import { EventBus } from '../../main.js';

export default {
  components: {
    Search,
    SortButton,
  },
  props: [
    'config',
    'fieldsWithSorting',
    'fieldsWithSearch',
    'pagination',
    'itemsPerPage',
  ],
  data: function() {
    return {
      headerData: {},
      queryString: '',
      allInputObjects: [],
      sortDirection: null,
      sortColumn: null,
    };
  },
  created() {
    EventBus.$on('addSearchInput', inputObject => {
      this.allInputObjects.push(inputObject);
    });

    EventBus.$on('changeInitialPropObject', dataForReplacement => {
      this.allInputObjects = dataForReplacement.reverse();
    });
    EventBus.$on('columnStatusHasChanged', ({ searchName, searchParam }) => {
      let paramCopy = searchParam;
      if (searchParam !== '') {
        const optionsArray = ['aktywn', 'zatwierdzon', 'zatwierdzony automatycznie', 'opublikowan', 'specjal'];
        const transformSearchParam = searchParam.toLowerCase();
        for (const option of optionsArray) {
          if (transformSearchParam.startsWith(option)) {
            paramCopy = { urlNumber: 1, paramForSessionStorage: searchParam };
            break;
          } else {
            paramCopy = { urlNumber: 0, paramForSessionStorage: searchParam };
          }
        }
      }

      const propCopy = [...this.allInputObjects];
      propCopy.forEach((item, index) => {
        if (item.label === searchName) {
          propCopy.splice(index, 1);
          propCopy.push({
            label: searchName,
            param: paramCopy,
          });
        }
      });

      this.queryString = '';
      propCopy.forEach((item, index) => {
        if (item.param !== '' && (typeof item.param) !== 'object') {
          if (index === 0) {
            this.queryString += item.label + '=' + item.param;
          } else {
            this.queryString += '&' + item.label + '=' + item.param;
          }
        } else if (item.param !== '' && (typeof item.param) === 'object') {
          if (index === 0) {
            this.queryString += item.label + '=' + item.param.urlNumber;
          } else {
            this.queryString += '&' + item.label + '=' + item.param.urlNumber;
          }
        }
      });

      const indexInString = this.pagination ? this.pagination['@id'].lastIndexOf('page=') : null;
      const currentPageNumber = this.pagination ? this.pagination['@id'].slice(indexInString + 1) : null;
      this.requestForData(currentPageNumber, () => {
        this.allInputObjects = propCopy;
      });
    });
    EventBus.$on('sortChanged', ({ columnName, sortDirection }) => {
      const indexInString = this.pagination['@id'].lastIndexOf('page=');
      const currentPageNumber = this.pagination['@id'].slice(indexInString + 1);

      this.sortDirection = sortDirection;
      this.sortColumn = columnName;

      this.requestForData(currentPageNumber);
    });
    this.fillHeaderData();
  },
  methods: {
    fillHeaderData() {
      for (const columnName in this.config.columns) {
        this.headerData[columnName] = {// {id: {…}, name: {…}, shortcut: {…}, isSpecial: {…}, isActive: {…},…}
          ...this.config.columns[columnName],
        };
      }
    },
    requestForData: function(currentPageNumber, callback) {
      let url;
      const currentPage = currentPageNumber !== false && parseInt(currentPageNumber) ? currentPageNumber : '';
      if (this.queryString === '') {
        if (this.sortColumn != null && this.sortDirection != null) {
          url = `${this.config.urlAPI}`;
          url += `${this.config.urlAPI.includes('context=') ? '&' : '?'}`;
          url += `order[${this.sortColumn}]=${this.sortDirection}`;
          url += `&itemsPerPage=${this.itemsPerPage}`;
          url += `${currentPage ? '&page=' + currentPage : ''}`;
        } else {
          url = `${this.config.urlAPI}`;
          url += `&itemsPerPage=${this.itemsPerPage}`;
        }
        this.$Progress.start();

        this.$http.get(url)
          .then(response => {
            this.$Progress.finish();
            callback ? callback() : null;
            const filtersObject = {
              ...JSON.parse(sessionStorage.getItem(this.config.tableName + '-' + 'filters')),
              search: this.allInputObjects.filter(item => {
                return item.param !== '';
              }),
            };

            if (this.config.stateManager.saveFilter) {
              sessionStorage.setItem(this.config.tableName + '-' + 'filters', JSON.stringify(filtersObject));
            }
            EventBus.$emit('paginationAction', response.data);
            EventBus.$emit('resetOtherSortButtons', { columnName: this.sortColumn, sortDirection: this.sortDirection });
            if (response.data['hydra:member'].length <= 0) {
              EventBus.$emit('setFinalTableDataToNull');
            }
          }).catch(() => {
            this.$Progress.fail();
          });
      } else {
        if (this.queryString[0] === '&') {
          this.queryString = this.queryString.substr(1, this.queryString.length);
        }
        if (this.sortColumn != null && this.sortDirection != null) {
          url = `${this.config.urlAPI}`;
          url += `${this.config.urlAPI.includes('context=') ? '&' : '?'}`;
          url += `${this.queryString}`;
          url += `&order[${this.sortColumn}]=${this.sortDirection}`;
          url += `${currentPage ? '&page=' + currentPage : ''}`;
          url += `&itemsPerPage=${this.itemsPerPage}`;
        } else {
          url = `${this.config.urlAPI}`;
          url += `${this.config.urlAPI.includes('context=') ? '&' : '?'}`;
          url += `${this.queryString}`;
          url += `&itemsPerPage=${this.itemsPerPage}`;
        }
        this.$Progress.start();

        this.$http.get(url)
          .then(response => {
            this.$Progress.finish();
            callback ? callback() : null;
            const filtersObject = {
              ...JSON.parse(sessionStorage.getItem(this.config.tableName + '-' + 'filters')),
              search: this.allInputObjects.filter(item => {
                return item.param !== '';
              }),
            };
            if (this.config.stateManager.saveFilter) {
              sessionStorage.setItem(this.config.tableName + '-' + 'filters', JSON.stringify(filtersObject));
            }
            EventBus.$emit('paginationAction', response.data);
            EventBus.$emit('resetOtherSortButtons', { columnName: this.sortColumn, sortDirection: this.sortDirection });
            if (response.data['hydra:member'].length <= 0) {
              EventBus.$emit('setFinalTableDataToNull');
            }
          }).catch(() => {
            this.$Progress.fail();
          });
      }
    },
    resetField(columnName) {
      let sortingParams;
      if (this.sortDirection != null && this.sortColumn != null) {
        sortingParams = `order[${this.sortColumn}]=${this.sortDirection}`;
      }
      const currentColumnObject = this.allInputObjects.find(item => {
        return item.label === columnName;
      });
      typeof currentColumnObject.param === 'object' ? currentColumnObject.param.urlNumber = '' : currentColumnObject.param = '';

      this.queryString = '';
      this.allInputObjects.forEach((item, index) => {
        if (item.param !== false && (typeof item.param) !== 'object') {
          if (index === 0) {
            this.queryString += item.label + '=' + item.param;
          } else {
            this.queryString += '&' + item.label + '=' + item.param;
          }
        } else if (item.param !== false && (typeof item.param) === 'object') {
          if (index === 0) {
            this.queryString += item.label + '=' + item.param.urlNumber;
          } else {
            this.queryString += '&' + item.label + '=' + item.param.urlNumber;
          }
        }
      });

      if (this.queryString === '') {
        let url;
        if (this.queryString[0] === '&') {
          this.queryString = this.queryString.substr(1, this.queryString.length);
        }
        this.$Progress.start();

        url = `${this.config.urlAPI}`;
        url += `&itemsPerPage=${this.itemsPerPage}`;
        url += `${sortingParams ? '&' + sortingParams : ''}`;
        this.$http.get(url)
          .then(response => {
            this.$Progress.finish();
            const filtersObject = {
              ...JSON.parse(sessionStorage.getItem(this.config.tableName + '-' + 'filters')),
              search: this.allInputObjects.filter(item => {
                return item.param !== '';
              }),
            };
            sessionStorage.setItem(this.config.tableName + '-' + 'filters', JSON.stringify(filtersObject));

            EventBus.$emit('paginationAction', response.data);
            if (response.data['hydra:member'].length <= 0) {
              EventBus.$emit('setFinalTableDataToNull');
            }
          }).catch(() => {
            this.$Progress.fail();
          });
      } else {
        let url;
        if (this.queryString[0] === '&') {
          this.queryString = this.queryString.substr(1, this.queryString.length);
        }
        this.$Progress.start();

        url = `${this.config.urlAPI}`;
        url += `${this.config.urlAPI.includes('context=') ? '&' : '?'}`;
        url += `${this.queryString}`;
        url += `&itemsPerPage=${this.itemsPerPage}`;
        url += `${sortingParams ? '&' + sortingParams : ''}`;
        fetch(url)
          .then(response => {
            return response.json();
          })
          .then(response => {
            this.$Progress.finish();
            const filtersObject = {
              ...JSON.parse(sessionStorage.getItem(this.config.tableName + '-' + 'filters')),
              search: this.allInputObjects.filter(item => {
                return item.param !== '';
              }),
            };
            sessionStorage.setItem(this.config.tableName + '-' + 'filters', JSON.stringify(filtersObject));

            EventBus.$emit('paginationAction', response.data);
            if (response.data['hydra:member'].length <= 0) {
              EventBus.$emit('setFinalTableDataToNull');
            }
          }).catch(() => {
            this.$Progress.fail();
          });
      }
    },
  },
  watch: {
    allInputObjects: function() {
      this.queryString = '';
      this.allInputObjects.forEach((item, index) => {
        if (item.param !== false && (typeof item.param) !== 'object') {
          if (index === 0) {
            this.queryString += item.label + '=' + item.param;
          } else {
            this.queryString += '&' + item.label + '=' + item.param;
          }
        } else if (item.param !== false && (typeof item.param) === 'object') {
          if (index === 0) {
            this.queryString += item.label + '=' + item.param.urlNumber;
          } else {
            this.queryString += '&' + item.label + '=' + item.param.urlNumber;
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.th-action {
    justify-content: center;
    &>span {
        margin-right:0 !important;
    }
}
</style>
