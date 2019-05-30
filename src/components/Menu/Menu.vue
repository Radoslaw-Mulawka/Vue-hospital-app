<template>
  <div v-if="loading==true" class="loader"></div>

  <div v-else class="tabs content__tabs" > <!-- style="margin-top:-20px" -->
    <vue-progress-bar></vue-progress-bar>
    <ul class="nav nav-fill nav-tabs" id="weekTab" role="tablist">
      <li :key="day.uuid" v-for="(day,index) in componentData.menuDays" class="nav-item">
        <a
          class="nav-link"
          :class="{active: index==0}"
          :id="`${day.dayOfWeek.name}-tab`"
          data-toggle="tab"
          :href="`#${day.dayOfWeek.name}`"
          role="tab"
          :aria-controls="day.dayOfWeek.name"
          aria-selected="false"
        >{{day.dayOfWeek.name}}</a>
      </li>
    </ul>
    <div class="tab-content" id="weekTabContent">
      <div
        :key="day.uuid"
        v-for="(day,index) in componentData.menuDays"
        class="tab-pane fade"
        :class='{"show active" : index==0}'
        :id="day.dayOfWeek.name"
        role="tabpanel"
        :aria-labelledby="day.dayOfWeek.name">

            <template v-if='day.menuMeals.length>0'> <!-- v-if='meal.menuPositions.length>0' -->
              <div v-for="meal in day.menuMeals" :key="meal.uuid" class="container-fluid mt-3">
                <div class="row">
                  <div class="col-md-12">
                    <div class="media">
                      <a :style='{"cursor": meal.image? "pointer" : "default !important"}' href="#" class="dropdown-menu-gallery-button" v-bind:id="'dropdownMenuButton-'+meal.uuid" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="text-white bg-primary small fe fe-camera dropdown-menu-camera" v-if="meal.image"></i>

                        <img v-if="meal.dMeal.icon" class="rounded-circle" alt="aa" :src='dataBaseUrl+meal.dMeal.icon' />
                        <img  v-else class="rounded-circle" alt="" :src='`${dataBaseUrl}/build/static/images/no_image.png`'  style="max-height:55px" />

                      </a>
                      <!-- dropdown gallery -->
                        <div v-if="meal.image" class="dropdown-menu dropdown-menu-gallery p-0" v-bind:aria-labelledby="'dropdownMenuButton-'+meal.uuid">
                          <div class="card border-0" style="max-width: 400px;">
                            <div class="card-header d-flex bg-white" >
                              <a target="_blank" rel="noopener noreferrer" :href="`${dataBaseUrl}/media/${meal.image.contentUrl}`" id="external-btn" class="btn btn-sm btn-outline-primary px-2"><i class="fe fe-external-link mr-2"></i>{{meal.image.contentUrl}}</a>
                            </div>
                            <div class="bg-light d-flex position-relative" style="min-height:200px; max-height:300px; overflow:auto">
                              <img v-if="imageLoad==true" src="../../static/images/mini_loader.gif" class="image-mini-loader" />
                              <template v-if="meal.image">
                                <img :src='`${dataBaseUrl}/media/${meal.image.contentUrl}`' class="d-block mx-auto" style="max-width:100%; object-fit: contain;" alt="No image available"> <!-- m-auto -->
                              </template>
                              <template v-else>
                                <img src="../../static/images/no_image.png" class="d-block mx-auto" style="max-width:400px; object-fit: contain;" alt="No image available"> <!-- m-auto -->
                              </template>
                            </div>
                          </div>
                        </div>
                      <!-- /dropdown gallery -->
                      <div class="media-body">
                        <h3 class="ml-3 mt-3">{{meal.dMeal.name}}</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="table-responsive mt-2 table--menu">
                  <table v-if='meal.menuPositions.length > 0' class="table table--grid table-sm">
                    <thead class="thead-light">
                      <tr>
                        <th class="w-25"></th>
                        <th></th>
                        <th colspan="4" style="border: 1px solid #cdcdcd;">Wartości na porcję</th>
                      </tr>
                      <tr>
                        <th>Produkt</th>
                        <th >Ilość na porcję</th>
                        <th>Energia [kcal]</th>
                        <th>Tłuszcz [g]</th>
                        <th>Białko [g]</th>
                        <th>Węglowodany [g]</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- ALREADY ADDED PRODUCTS -->
                      <template v-if='meal.menuPositions.length>0'>
                          <tr  v-for='position in meal.menuPositions' :key='position.uuid'>
                              <td class="w-25">
                                  <span v-if='position.material'>{{position.material.name}}</span>
                                  <span v-else>{{position.recipe.name}}</span>
                              </td>
                              <td>
                                  <span>{{position.recipe !== null ? position.recipe.portionValue  : position.quantity}}</span>
                              </td>

                              <td>{{valuesPerPortion(position, 'energyInKcal',day,meal)}}</td>
                              <td>{{valuesPerPortion(position, 'fat',day,meal)}}</td>
                              <td>{{valuesPerPortion(position, 'protein',day,meal)}}</td>
                              <td>{{valuesPerPortion(position, 'carbohydrates',day,meal)}}</td>
                          </tr>
                      </template>
                    </tbody>
                  </table>

                  <table v-else class="table table--grid table-sm">
                     <tr><h5 >Brak pozycji w danym posiłku</h5></tr>
                  </table>
                </div>
              </div>
            </template>

            <!-- Total summ block -->
            <div v-if='day.menuMeals.length>0' class="container-fluid mt-3">
                <div class="table-responsive table--menu">
                    <table v-if='checkMealsPositions(day.menuMeals)' class="table table--grid table-sm">
                        <thead class="thead-light">
                            <tr>
                                <th class="w-25"> </th>
                                <th></th>
                                <th colspan="4" style="border: 1px solid #cdcdcd;">Wartości na dzień</th>
                            </tr>
                            <tr>
                                <th></th>
                                <th></th>
                                <th >Energia [kcal]</th>
                                <th>Tłuszcz [g]</th>
                                <th>Białko [g]</th>
                                <th>Węglowodany [g]</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="font-weight-bold">
                                <td  class="border-bottom-0 w-25">
                                    &nbsp;
                                </td>
                                <td class="border-bottom-0 font-weight-bold">Podsumowanie całości</td>
                                <td class="border-bottom-0" >{{summForWholeDayPortion(day, 'energyInKcal')}}</td>
                                <td class="border-bottom-0" >{{summForWholeDayPortion(day, 'fat')}}</td>
                                <td class="border-bottom-0" >{{summForWholeDayPortion(day, 'protein')}}</td>
                                <td class="border-bottom-0" >{{summForWholeDayPortion(day, 'carbohydrates')}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-else class="container-fluid mt-3" style='margin: 20px !important;'>
               <h3 style='text-align: center;'>Brak posiłków w danym dniu</h3>
            </div>

      </div>
    </div>
  </div>
</template>

<script>

import { baseUrl } from '../../main.js';
import { EventBus } from '../../main.js';
export default {
  data: function() {
    return {
      typeOfMeal: [],
      currentSelectedMeal: '',
      selectedProduct: {},
      currentStatus: false,
      componentData: null,

      imageLoad: false,
      loading: false,
      file: '',
      fileName: null,
      mealImage: null,
      mediaObjectId: null,

      menuid: null,
      endpoint: null,
      dataBaseUrl: baseUrl,
    };
  },

  created() {
    this.menuid = this.$route.params.id;
    this.endpoint = `/api/app/menus/${this.menuid}?context=menu`;

    this.loading = true;
    this.$Progress.start();

    this.$http.get(this.endpoint)
      .then(response => {
        this.componentData = {
          ...response.data,
          menuDays: response.data.menuDays.map(day => {
            return {
              ...day,
              menuMeals: day.menuMeals.map(meal => {
                return {
                  ...meal,
                  editMode: false,
                };
              }),
            };
          }),
        };
        this.currentStatus = response.data.isActive;
        this.loading = false;
        this.$Progress.finish();
        EventBus.$emit('menuData', this.componentData.diet);
      }).catch(() => {
        this.$Progress.fail();
      });

    this.$http.get('/api/app/d_meals?context=dMeal&active_or_selected=null')
      .then(response => {
        this.typeOfMeal = [...response.data['hydra:member']];
      }).catch(() => {
        this.$Progress.fail();
      });
  },
  methods: {
    valuesPerPortion: function(position, type, day, meal) {
      if (position.recipe == null) {
        return ((position.material.nutritionalValuesAssigned[type] * (position.quantity - (position.quantity * position.material.nutritionalValuesAssigned.wastePercent) / 100)) / 100).toFixed(2);
      } else {
        return position.recipe.nutritionalValuesAssignedSum[type];
      }
    },
    mealSummPerPortion: function(day, meal, type) {
      const currentMealPositions = meal.menuPositions ? [...meal.menuPositions] : false;
      const summ = {
        [type]: 0,
      };
      if (currentMealPositions !== false) {
        for (const matOrRec of currentMealPositions) {
          if (matOrRec.material !== null) {
            for (const nutValue in matOrRec.material.nutritionalValuesAssigned) {
              if (nutValue === type) {
                summ[type] +=
                  (matOrRec.material.nutritionalValuesAssigned[nutValue] *
                    (matOrRec.quantity - (matOrRec.quantity * matOrRec.material.nutritionalValuesAssigned.wastePercent) / 100)) / 100;
              }
            }
          } else {
            for (const nutValue in matOrRec.recipe.nutritionalValuesAssignedSum) {
              if (nutValue === type) {
                summ[type] += matOrRec.recipe.nutritionalValuesAssignedSum[nutValue];
              }
            }
          }
        }

        return summ[type].toFixed(2);
      } else {
        return summ[type].toFixed(2);
      }
    },
    summForWholeDayPortion(day, type) {
      const currentMeals = day.menuMeals; // [{}]

      const positions = [];

      for (const meal of currentMeals) {
        if (meal.menuPositions) {
          for (const position of meal.menuPositions) {
            positions.push(position);
          }
        }
      }

      const summ = {
        [type]: 0,
      };
      for (const matOrRec of positions) {
        if (matOrRec.material !== null) {
          summ[type] +=
            (matOrRec.material.nutritionalValuesAssigned[type] *
              (matOrRec.quantity -
                (matOrRec.quantity *
                  matOrRec.material.nutritionalValuesAssigned.wastePercent) /
                  100)) /
            100;
        } else {
          summ[type] += matOrRec.recipe.nutritionalValuesAssignedSum[type];
        }
      }
      return summ[type].toFixed(2);
    },
    checkMealsPositions(meals) {
      if (meals.length > 0) {
        return meals.some(meal => {
          return meal.menuPositions.length > 0;
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../css/variables';

.loader {
  margin-top: 20px;
  margin-bottom: 20px;
}

.vdp-datepicker__calendar {
  left: -120px;
  top: 30px;
}
.nav-link.active:hover {
  color: #8796a5 !important;
  background-color: #fff !important;
}
.vdp-datepicker {
  input {
    background-color: transparent;
    border: 0.5px solid;
    border-color: #707070;
    color: #9f9c9c;
    text-align: center;
  }
}
.meal-select {
  color: $thead-txt-dark-color;
  border-radius: 5px;
  border: 1px solid $form-input-border-col;
  padding: 3px 0 3px 10px;
}
.meal-select__option {
  font-weight: 600;
}
.meal-select__option[disabled="disabled"] {
   color:$tbody-txt-col;
}
.media {
  display: flex;
  align-items: default !important;
}
.media-body {
  display: flex;
  align-items: center;
  img {
    width: 13px;
    height: auto;
    margin-left: 5px;
    cursor: pointer;
  }
}

.table--menu {
  overflow: auto !important;
  white-space: nowrap;
  th:nth-child(2){
    width:210px;
  }
  th:last-child {
    max-width:50px;
  }
}
.dropdown-menu {
    transform: translate3d(15px, 55px, 0px) !important;
    top: 0px !important;
    left: 0px !important;
}
.dropdown-menu-gallery-button {
  position: relative;
  .dropdown-menu-zoom {
    display: none;
    color: $white;
    text-shadow: 0 0 3px rgba(0,0,0,.5);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &:hover {
    .dropdown-menu-zoom {
      display: block;
    }
  }
  .dropdown-menu-camera {
    position: absolute;
    padding:4px;
    border:1px solid #ccc;
    border-radius: 50%;
    top:0;
    left:0;
  }
}
</style>

