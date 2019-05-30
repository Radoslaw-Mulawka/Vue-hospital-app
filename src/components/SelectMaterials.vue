<template>
    <div id="materialForm">
        <input  class="form__input w-100" id="materialInput" ref='materialInput' value="" placeholder="Wpisz minimum 3 znaki..."
              @change='backToInput' v-model="searchName" @keyup='checkName' @keyup.down='scrollDownInput' v-bind:class="{ 'form__input--loader' : isSearching }"/>
        <!-- Result -->
        <div id="result" class="list-group" v-if="items && items.length && !selectItem">
            <a @keyup.down='scrollDown' @keyup.up='scrollUp' @keyup.enter='backToInput' :id="value.id" class="list-group-item list-group-item-action flex-column align-items-start"
                v-for="(value, key) of items"
                v-on:click="select(key)" :key='value.id' :ref='value.id' href='#'>
                <div class="d-flex w-100 justify-content-between">
                    <p class="mb-1">{{ key + 1 }}. {{ value.name }}</p>
                    <small v-if="value.nutritionalValuesAssigned" class="text-muted">{{ value.nutritionalValuesAssigned['energyInKcal'] }} kcal</small>
                    <small v-else-if="value.nutritionalValuesAssignedSum" class="text-muted">{{ value.nutritionalValuesAssignedSum['energyInKcal'] }} kcal</small>
                    <small v-else-if="value.sapNumber" class="text-muted">SAP: {{ value.sapNumber }}</small>
                </div>
                <template v-if="withoutNVA">
                    <small v-if="value" class="text-muted">
                        Jm: {{ value.unit.shortcut }} &#8226;
                        Stan magazynowy: {{ value.inventories.length > 0 ? value.inventories[0].availability : 0 }} &#8226;
                        Minimum: {{ value.inventories.length > 0 ? value.inventories[0].minimumConditional : 0 }} &#8226;
                        Cena: {{ value.inventories.length > 0 ? parseFloat(value.inventories[0].price).toFixed(2) : 0 }}
                    </small>
                </template>
                <template v-else>
                    <small v-if="value.nutritionalValuesAssigned" class="text-muted">
                        Węglowodany: {{ value.nutritionalValuesAssigned['carbohydrates'] }}g &#8226; Białko: {{ value.nutritionalValuesAssigned['protein'] }}g &#8226; Tłuszcz: {{ value.nutritionalValuesAssigned['fat'] }}g
                    </small>
                    <small v-else-if="value.nutritionalValuesAssignedSum" class="text-muted">
                        Węglowodany: {{ value.nutritionalValuesAssignedSum['carbohydrates'] }}g &#8226; Białko: {{ value.nutritionalValuesAssignedSum['protein'] }}g &#8226; Tłuszcz: {{ value.nutritionalValuesAssignedSum['fat'] }}g
                    </small>
                </template>
            </a>
        </div>
        <div id="result" class="list-group" v-if="noDataReturned">
            <a class="list-group-item list-group-item-action flex-column align-items-start">
                <div class="d-flex w-100 justify-content-between">
                    <p class="mb-1">Brak surowców</p>
                </div>
            </a>
        </div>
    </div>
</template>

<script>
export default {
  name: 'SelectMaterials',
  props: {
    materials: {
      type: Boolean,
      required: true,
    },
    recipes: {
      type: Boolean,
      default: false,
    },
    withoutNVA: {
      type: Boolean,
      default: false,
    },
    onSelectedMaterial: {
      type: Function,
      required: true,
    },
    dayData: Object,
  },
  data() {
    return {
      config: {
        urlAPIFetchMaterials: '/api/materials?context=material&itemsPerPage=35&isActive=true&nutritionalValuesAssigned[exists]=true',
        urlAPIFetchRecipes: '/api/recipes?context=recipe&isActive=true&itemsPerPage=35',
        urlAPIFetchMaterialsWithoutNVA: '/api/materials?context=material&itemsPerPage=35&isActive=true',
      },
      searchName: null,
      isSearching: false,
      selectItem: null,
      noDataReturned: false,
      items: [],
      timer: null,
      itemsCounter: 0,
    };
  },
  created() {

  },
  watch: {
    selectItem() {
      const el = this.$refs['materialInput'];
      el.focus();
      this.itemsCounter = 0;
    },
    noDataReturned() {
      if (this.noDataReturned === true) {
        setTimeout(() => {
          this.noDataReturned = false;
        }, 1500);
      }
    },
  },
  methods: {
    scrollDownInput($event) {
      event.target.blur();
      const el = this.$refs[this.items[this.itemsCounter].id][0];
      el.focus();
    },
    scrollDown($event) {
      if (this.itemsCounter < this.items.length - 1) {
        this.itemsCounter += 1;
        const el = this.$refs[this.items[this.itemsCounter].id][0];
        el.focus();
      } else {
        this.itemsCounter -= 1;
        const el = this.$refs[this.items[this.items.length - 1].id][0];
        el.focus();
      }
    },
    scrollUp($event) {
      if (this.itemsCounter > 0) {
        this.itemsCounter -= 1;
        const el = this.$refs[this.items[this.itemsCounter].id][0];
        el.focus();
      } else {
        const el = this.$refs[this.items[0].id][0];
        el.focus();
      }
    },
    backToInput($event) {
      const el = this.$refs['materialInput'];
      el.focus();
    },
    checkName() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        if (this.searchName.length >= 3 && !this.selectItem) {
          if (this.withoutNVA) {
            this.searchMaterials(this.config.urlAPIFetchMaterialsWithoutNVA + '&name=' + this.searchName);
          } else if (this.materials && this.recipes) {
            this.searchMaterialsAndRecipes(this.config.urlAPIFetchMaterials + '&name=' + this.searchName, this.config.urlAPIFetchRecipes + '&name=' + this.searchName);
          } else {
            this.searchMaterials(this.config.urlAPIFetchMaterials + '&name=' + this.searchName);
          }
        } else if (this.searchName.length === 0) {
          this.items = null;
          this.selectItem = null;
        } else if (this.selectItem && this.searchName !== this.selectItem['name']) {
          this.items = null;
          this.selectItem = null;

          if (this.withoutNVA) {
            this.searchMaterials(this.config.urlAPIFetchMaterialsWithoutNVA + '&name=' + this.searchName);
          } else if (this.materials && this.recipes) {
            this.searchMaterialsAndRecipes(this.config.urlAPIFetchMaterials + '&name=' + this.searchName, this.config.urlAPIFetchRecipes + '&name=' + this.searchName);
          } else {
            this.searchMaterials(this.config.urlAPIFetchMaterials + '&name=' + this.searchName);
          }
        } else {
          this.items = null;
        }
      }, 800);
    },
    searchMaterials(urlGet) {
      this.isSearching = true;
      this.noDataReturned = false;
      fetch(urlGet).then(response => {
        return response.json();
      }).then(data => {
        this.items = data['hydra:member'];
        if (this.items.length < 1) {
          this.noDataReturned = true;
        }
        this.isSearching = false;
      });
    },
    searchMaterialsAndRecipes(materialsUrl, recipesUrl) {
      this.isSearching = true;
      this.noDataReturned = false;

      const urlArray = [materialsUrl, recipesUrl];
      const promises = urlArray.map(url => {
        return fetch(url).then(response => {
          return response.json();
        });
      });

      Promise.all(promises).then(result => {
        const dataMemberObject = [];
        result.map(apiObject => {
          apiObject['hydra:member'].map(item => {
            dataMemberObject.push(item);
          });
        });
        this.items = dataMemberObject;
        if (this.items.length < 1) {
          this.noDataReturned = true;
        }
        this.isSearching = false;
      });
    },
    select: function (key) {
      this.selectItem = this.items[key];
      this.searchName = this.selectItem['name'];
      this.onSelectedMaterial(this.selectItem, this.dayData);
      this.items = [];
    },

    reset: function () {
      this.selectItem = null;
      this.searchName = '';
      this.update(null);
    },

    hideResult: function () {
      this.items = [];
    },
  },

};
</script>

<style css="scss" scoped>
    /* @import './../css/variables'; */
    #result {
        position: absolute;
        z-index: 10;
        display: inline-block;
        max-height: 300px;
        overflow: auto;
        margin: 0px;
        min-width: 24%;
        max-width: 25%;
        box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.24);
    }
    #materialForm {
        white-space: normal;
    }
</style>
