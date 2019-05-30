<template>
    <div class='table-container table-responsive' style='display: grid; overflow-x: auto;'>
        <vue-progress-bar></vue-progress-bar>
        <div :class='{"tool-bar":true,  "tool-bar--sticky": itemsPerPage>50}'>
            <div class="table-pagination__show-select">
                <select v-model='itemsPerPage'>
                    <option value="25">25 <span>na stronę</span></option>
                    <option value="50">50 <span>na stronę</span></option>
                    <option value="100">100 <span>na stronę</span></option>
                    <option value="250">250 <span>na stronę</span></option>
                    <option value="500">500 <span>na stronę</span></option>
                    <option value="1000">1000 <span>na stronę</span></option>
                </select>
            </div>
            <Pagination v-if='pagination !=null && pagination["hydra:last"]'
                        :config='config'
                        :pagination='pagination'
                        :top='true'
                        :itemsPerPage='itemsPerPage'>
            </Pagination>
            <div v-if='config.exportToExcel == true' class="export">
                <a @click='exportToExcel'><i class="icon-xls"></i> Export do Excela</a>
            </div>

        </div>
        <table class='content__table content__table--white'>
            <Thead :config='config'
                   :fieldsWithSearch='fieldsWithSearch'
                   :fieldsWithSorting='fieldsWithSorting'
                   :pagination='pagination'
                   :itemsPerPage='itemsPerPage'>
            </Thead>
            <Tbody :finalTableData='finalTableData'
                   :config='config'
                   :originalData='originalData'>
            </Tbody>
        </table>

        <div :class='{"tool-bar":true, "tool-bar--bottom":true}' style='justify-content:center'>
            <div class="table-pagination__show-select">
                <select v-model='itemsPerPage'>
                    <option value="25">25 <span>na stronę</span></option>
                    <option value="50">50 <span>na stronę</span></option>
                    <option value="100">100 <span>na stronę</span></option>
                    <option value="250">250 <span>na stronę</span></option>
                    <option value="500">500 <span>na stronę</span></option>
                    <option value="1000">1000 <span>na stronę</span></option>
                </select>
            </div>
            <Pagination
                    v-if='pagination !=null && pagination["hydra:last"]'
                    :config='config'
                    :pagination='pagination'
                    :top='true'
                    :itemsPerPage='itemsPerPage'>
            </Pagination>
        </div>
    </div>
</template>

<script>
import Thead from './Thead.vue';
import Tbody from './Tbody.vue';
import Pagination from './Pagination.vue';
import { EventBus } from '../../main.js';

export default {
  props: ['conf'],
  components: {
    Thead,
    Tbody,
    Pagination,
  },
  data: function() {
    return {
      config: null,
      tableData: [],
      finalTableData: [{ 'isLoading': true }],
      pagination: null,
      fieldsWithSearch: [],
      fieldsWithSorting: [],
      itemsPerPage: 25,
      originalData: null,
      sortColumn: null,
      sortDirection: null,
    };
  },
  created: function() {
    EventBus.$on('callGetDataOnCreation', (itemsPerPage) => {
      this.itemsPerPage = itemsPerPage;
      this.getDataOnCreation();
    });
    EventBus.$on('setFinalTableDataToNull', () => {
      this.finalTableData = null;
    });
    EventBus.$on('sortChanged', ({ columnName, sortDirection }) => {
      this.sortDirection = sortDirection;
      this.sortColumn = columnName;
    });
    if (this.conf != null) {
      if (this.conf.actions !== undefined) {
        this.conf.actions.length > 0 ? null : this.conf.columns.actions.areShown = false;
      }
      this.config = this.conf;
    } else {
      throw new Error({ 'GridConfig': "Can't find config file" });
    }
    this.getDataOnCreation();
  },
  methods: {
    exportToExcel() {
      const jsonToSend = {
        columns: {},
        rows: {},
      };

      for (const columnName in this.config.columns) {
        if (columnName !== 'actions' && this.config.columns[columnName]['areShown'] === true) {
          jsonToSend.columns[columnName] = this.config.columns[columnName].label;
        }
      }
      for (const [index, rowObject] of this.finalTableData.entries()) {
        jsonToSend.rows[index] = {};
        for (const prop in rowObject) {
          if (rowObject[prop]['areShown'] === true) {
            jsonToSend.rows[index] = {
              ...jsonToSend.rows[index],
              [prop]: rowObject[prop].value ? rowObject[prop].value : '',
            };
          }
        }
      }
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      this.$Progress.start();
      this.$http.post(`/api/generate/xlsx`, jsonToSend, {
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob',
      }).then(response => {
        return response;
      }).then(blob => {
        this.$Progress.finish();
        blob = new Blob([blob.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = year.toString() + month.toString() + day.toString() + hours.toString() + minutes.toString() + seconds.toString();

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch(() => {
        this.$Progress.fail();
      });
    },
    getDataOnCreation: function() {
      const filtersObject = JSON.parse(sessionStorage.getItem(this.conf.tableName + '-' + 'filters'));
      if (this.config.stateManager.saveFilter === false && filtersObject && filtersObject.search) {
        delete filtersObject.search;
        sessionStorage.setItem(this.conf.tableName + '-' + 'filters', JSON.stringify(filtersObject));
      }
      let url = this.config.urlAPI;
      url += `&itemsPerPage=${this.itemsPerPage}`;
      url += `${(this.sortColumn && this.sortDirection) ? '&order' + '[' + this.sortColumn + ']' + '=' + this.sortDirection : ''}`;

      if (filtersObject !== null && (Object.entries(filtersObject).length > 0)) {
        for (const key in filtersObject) {
          if (key === 'search') {
            filtersObject[key].map(item => {
              if (typeof item.param !== 'object') {
                url += `&${item.label}=${item.param}`;
              } else {
                url += `&${item.label}=${item.param.urlNumber}`;
              }
            });
          } else if (key === 'selectedRow') {
            continue;
          } else {
            url += `&${filtersObject[key]}`;
          }
        }
      }

      this.$Progress.start();
      this.$http.get(url)
        .then(response => {
          this.$Progress.finish();
          this.fieldsWithSearch = [];
          this.fieldsWithSorting = [];

          if (this.config.arrayCollection && this.config.arrayCollection.length > 0) { // what is it?????????????
            this.tableData = response.data[this.config.arrayCollection];
          }

          // part responsible for sorting and filtering depending on what has been got from API
          if (response.data['hydra:search']) {
            const mapping = response.data['hydra:search']['hydra:mapping'];

            // declare what columns should be sortable / filterable
            for (const valueObject of mapping) {
              if (valueObject.property === valueObject.variable) {
                this.fieldsWithSearch.push(valueObject.property);
              }
              if (valueObject.variable.includes('order')) {
                this.fieldsWithSorting.push(valueObject.property);
              }
            }
          }

          if (response.data['hydra:member'].length > 0) {
            this.tableData = response.data['hydra:member'];
            this.pagination = response.data['hydra:view'];
          } else {
            this.finalTableData = [{ 'lackOfData': true }];
          }
        }).catch(() => {
          this.finalTableData = [{ 'lackOfData': true }];
          this.$Progress.fail();
        });

      EventBus.$on('paginationAction', passedData => {
        this.tableData = passedData['hydra:member'];
        this.pagination = passedData['hydra:view'];
      });
    },
    // DRY CODE

    getNestedObject(key, myObj) {
      const getNestedObject = (nestedObj, pathArr) => {
        return pathArr.reduce((obj, key) =>
          (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
      };

      const link = key.split('.'); // materialType.name = ['materialType', 'name']
      const nestedObject = getNestedObject(myObj, link);
      return nestedObject;
    },
    transformTableData(columns) {
      const tableDataCopy = [];
      for (const key in columns) {  // key = actions, id, isSpecial (english names of columns)
        this.tableData.map(myObj => {
          if (tableDataCopy.find((element, index) => {
            const elementId = element['@id'].split('/');
            const myObjId = myObj['@id'].split('/');
            return elementId.reverse()[0] === myObjId.reverse()[0];
          }) === undefined) {
            tableDataCopy.push({ ...myObj });
          }

          if (key.includes('.') === true) {
            myObj[key] = this.getNestedObject(key, myObj);
          }
          if (columns[key].fun) {
            myObj[key] = columns[key].fun(myObj); // if column.name object has 'fun' inside it, than myObj[name] will be equal to result of 'fun', to which you passed current myObj.
          }                                         // myObj[key] содержит результат выполнения функции с переданным ей объектом myObj.
          myObj[key] = {
            areShown: columns[key].areShown,
            label: columns[key].label,
            value: myObj[key],
          };
        });
      }

      this.originalData = tableDataCopy;
    },
    fillFinalTableData(columns) {
      this.finalTableData = [];
      if (this.tableData.length > 0) {
        for (const element of this.tableData) {
          const newObj = {};
          for (const column in columns) {
            if (column !== 'actions') {
              newObj[column] = {
                areShown: element[column].areShown,
                value: element[column].value,
              };
            }
          }
          this.finalTableData.push(newObj);
        }
      } else {
        this.finalTableData = [{ 'lackOfData': true }];
      }
    },
    loadDataFromSessionStorage() {
      const filtersObject = JSON.parse(sessionStorage.getItem(this.conf.tableName + '-' + 'filters'));
      if (this.config.stateManager.saveClickedRow === true) {
        if (filtersObject !== null && (Object.entries(filtersObject).length > 0)) {
          const indexInSessionStorage = filtersObject['selectedRow']; // 3
          const object = this.finalTableData[indexInSessionStorage];
          EventBus.$emit('fireShowRowDetails', { object, indexInSessionStorage });
        }
      }
    },
  },
  updated() {
    this.config.stateManager.saveFilter ||
      this.config.stateManager.saveSorting ||
      this.config.stateManager.saveClickedRow ? this.loadDataFromSessionStorage() : null;// 6
  },
  watch: {
    tableData: function() {
      const columns = this.config.columns; // { actions: {}, id: {}, name:{}, isActive:{}, isSpecial:{} }
      this.transformTableData(columns); // 3
      this.fillFinalTableData(columns); // 5
      this.config.stateManager.saveFilter ||
        this.config.stateManager.saveSorting ||
        this.config.stateManager.saveClickedRow ? this.loadDataFromSessionStorage() : null;// 6
    },
    itemsPerPage() {
      this.getDataOnCreation();
    },
  },
};
</script>

<style lang="scss">
    @import '../../css/variables';

    .status-span {
        color: $status-col;
    }

    #table-component {
        padding: 0;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .no-data {
        text-align: center;
        border: none;

        &:hover {
            background-color: transparent !important;

        }

        td, th {
            border: none !important;
            cursor: default;
        }
    }

    .loader {
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 2s linear infinite;
        margin: 0 auto;
    }

    .table-container {
        background-color: white;
        //   border-radius: 5px;
        width: 100%;
        //   padding: 30px 0;
        //   padding-bottom:20px;
        //   overflow-x:auto;
    }

    .content {
        &__table {
            text-align: left;
            border-collapse: collapse;
            width: 100%;
            font-family: 'Quicksand medium';

            .table-grid {
                display: grid;
                grid-template-columns: 1fr;
                grid-template-rows: auto 25px;
            }

            .table-grid-one-row {
                grid-template-rows: auto;
            }

            thead {
                color: $thead-txt-dark-color;
                font-size: 13px;

                tr {
                    vertical-align: top;
                }
            }

            tbody {
                color: $tbody-txt-col;
                font-size: 14px;
                @media screen and (max-width: 1280px) {
                    font-size: 12px;
                }
            }

            tbody tr:nth-child(even) {
                background-color: #f9f9f9;

                &:hover {
                    background-color: darken(#f9f9f9, 10%);
                }
            }

            tr:first-child {
                // usuwam - teraz tabele się łamią
                // white-space: nowrap;
            }

            tr:not(.head-tr) {
                // height: 50px;
                padding-top: 25px;
                padding-bottom: 25px;

                &:hover {
                    background-color: #ebebeb;
                    cursor: pointer;
                }
            }

            td,
            th {
                border-bottom: 1px solid #d8d8d8;
                padding-left: 15px;
                padding-right: 15px;
                padding-top: 15px;
                padding-bottom: 15px;

                &:first-child {
                    // width: 50px;
                    // text-align: center;
                    vertical-align: middle;
                    position: relative;

                    & > input[type='checkbox'] {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        height: 30px;
                        width: 30px;

                        -webkit-appearance: none;
                        -moz-appearance: none;
                        appearance: none;
                        outline: 0;
                        background: transparent;
                        border: 1px solid lightgray;
                        border-radius: 5px;
                    }

                    & > input[type="checkbox"]:checked {
                        background: black;
                    }

                    & > input[type="checkbox"]:after {
                        content: '';
                        position: relative;
                        left: 40%;
                        top: 50%;
                        width: 15%;
                        height: 40%;
                        border: solid #fff;
                        border-width: 0 2px 2px 0;
                        transform: translate(0, -50%) rotate(45deg);
                        display: none;
                    }

                    & > input[type="checkbox"]:checked:after {
                        display: block;
                    }

                    & > input[type="checkbox"]:disabled:after {
                        border-color: #7b7b7b;
                    }
                }

                &:first-child:not(td) {
                    vertical-align: top;
                }
            }

            .all-actions {
                position: static !important;
                transform: none !important;
            }
        }
    }

    .tool-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background-color: $grid-toolbar-bg;
        // border-radius: 5px 5px 0px 0px;
        width: 100%;

        &--sticky {
            position: sticky;
            top: -1px;
            z-index: 10;
        }

        &--bottom {
            // border-radius: 0px 0px 5px 5px;
        }

        select {
            background-color: transparent;
        }
    }

    .export {
        display: flex;
        align-items: center;

        i {
            font-size: 30px;
            margin-right: 10px;
        }

        a {
            display: flex;
            align-items: center;
            color: $grid-toolbar-btn !important;
            cursor: pointer;
        }
    }
</style>

