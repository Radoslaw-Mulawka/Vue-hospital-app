//    import {baseUrl} from '../../main';
// let tableNameDiets = 'user_active_diets';
// let contextDiets = '?context=dietGrid';
// let contextMenu = "?context=menuGrid";

const tableName = 'user_active_diets';
const context = '?context=dietGrid';
const tableNameMenu = 'menus';

const conf = {
  urlAPI: '/api/app/' + tableName + context,
  tableName: 'AS_' + tableName,
  context: context,
  exportToExcel: false,
  stateManager: {
    saveFilter: true,
    saveSorting: true,
    saveClickedRow: false,
  },
  columns: {
    uuid: {
      areShown: false,
      label: 'UUID',
    },
    name: {
      areShown: true,
      label: 'Nazwa diety',
      order: true,
      search: true,
    },
    color: {
      areShown: true,
      label: 'Kolor',
      order: false,
      search: false,
      fun: function(data) {
        let output = '';
        if (data.color) {
          output =
            `<div class=\'rounded-circle\' style=\'border:1px solid #ccc; height:14px; width:14px; background:` +
            data.color +
            `\'></div>`;
        } else {
          output = 'Brak';
        }
        return output;
      },
    },
    shortcut: {
      areShown: true,
      label: 'Skrót',
      order: true,
      search: true,
    },
    isSpecial: {
      areShown: true,
      label: 'Typ diety',
      order: true,
      search: true,
      options: ['Standardowa', 'Specjalna'],
      type: 'select',
      fun: function(data) {
        let output = '';
        if (data.isSpecial === false) {
          output = `<span class="status-span">${this.options[0]}</span>`;
        } else {
          output = `<span style=\'color:#e75858\'>${this.options[1]}</span>`;
        }
        return output;
      },
    },
    isActive: {
      areShown: true,
      label: 'Status',
      order: false,
      search: false,
      options: ['Aktywna', 'Nieaktywna'],
      type: 'select',
      fun: function(data) {
        let output = '';
        if (data.isActive === true) {
          output = `<span style=\'color:#00e09a\'>${this.options[0]}</span>`;
        } else {
          output = `<span style=\'color:#e75858\'>${this.options[1]}</span>`;
        }
        return output;
      },
    },
    actions: {
      areShown: true,
      label: 'Akcje',
    },
    activeMenu: {
      areShown: false,
      label: 'Aktywny jadłospis',
    },
  },
  actions: [
    {
      type: 'show',
      text: 'Pokaż jadłospis',
      url: tableNameMenu + '/show/{uuid}',
    },
    {
      type: 'file',
      text: 'Pobierz PDF',
      url: '/api/app/menus/{uuid}/pdf',
    },
  ],
};

export default conf;
