<template>
    <div class="container-fluid" style='margin-top:30px'>
        <vue-progress-bar></vue-progress-bar>
        <template v-if="nPlanData.uuid && serverTime !== null && computedPositions.length !== 0">
            <div class="row">
                <div v-if="nPlanData.status" class="col-12">
                    <div class="alert alert-warning alert--grouped mb-4">
                        <i class="fe fe-alert-triangle mr-2"></i>
                        Plan został już zatwierdzony, więc możliwy jest tylko jego podgląd lub korekta.
                    </div>
                </div>

                <div class="col-md-12">
                    <div class="card-deck">

                        <div class="card card-content shadow-sm">
                            <div class="card-header shadow border-primary">
                                <div class="d-flex align-content-between border-bottom mb-1 pb-0">
                                    <p class="h3 text-muted mb-1">Klient</p>
                                    <div class="card-options ml-auto align-self-center">

                                    </div>
                                </div>
                                <span class="card-title">{{ nPlanData.companyDepartment.company.name }}</span>
                            </div>
                            <div class="card-body">
                                <p class="small border-bottom pb-1 mb-1">
                                    <span class="text-muted">
                                        <i class="fe fe-tag pr-2"></i>Oddział:
                                    </span>
                                    <template v-if="nPlanData.companyDepartment">
                                        {{ nPlanData.companyDepartment.name }}
                                    </template>
                                </p>
                                <p class="small mb-0"><span class="text-muted"><i class="fe fe-map-pin pr-2"></i>Adres: </span>
                                    <template v-if="nPlanData.companyDepartment">
                                        {{ nPlanData.companyDepartment.address }} {{ nPlanData.companyDepartment.postalCode }} {{ nPlanData.companyDepartment.city }}
                                    </template>
                                    <template v-else>
                                        {{ nPlanData.client.company.address }} {{ nPlanData.client.company.postalCode }} {{ nPlanData.client.company.city }}
                                    </template>
                                </p>
                            </div>
                        </div><!-- /card -->

                        <!-- breakpoint separator -->
                        <div class="w-100 d-lg-none mt-2"></div>

                        <div class="card card-content shadow-sm">
                            <div class="card-header shadow border-warning">
                                <div class="d-flex align-content-between border-bottom mb-1 pb-0">
                                    <p class="h3 text-muted mb-1">Szczegóły planu</p>
                                    <div class="card-options ml-auto align-self-center">
                                        <span
                                            v-if="nPlanData.status === true"
                                            class="badge badge-success p-2"
                                        >
                                                <i class="fe fe-lock mr-2"></i>Zatwierdzony
                                        </span>
                                        <span
                                            v-else
                                            class="badge badge-primary p-2"
                                        >
                                            <i class="fe fe-unlock mr-2"></i>Otwarty
                                        </span>
                                    </div>
                                </div>
                                <span class="card-title">
                                    <span class="text-muted">
                                        <i class="fe fe-user pr-2"></i>Sporządził:
                                    </span> {{ nPlanData.createdBy.fullName }}<br/>
                                    <span class="text-muted">
                                        <i class="fe fe-calendar pr-2"></i>Dnia:
                                    </span> {{ nPlanData.createdAt }}
                                </span>
                            </div>
                            <div class="card-body">
                                <p class="small border-bottom pb-1 mb-1">
                                    <span class="text-muted">
                                        <i class="fe fe-activity pr-2"></i>Status:
                                    </span>
                                    {{ nPlanData.status === true ? 'Zatwierdzony automatycznie' : 'Otwarty' }}
                                </p>
                                <template v-if="canEditPlanValues && allowToEdit">
                                    <textarea
                                        @change="updateDocument({'notes': nPlanData.notes})"
                                        class="form__textarea w-100"
                                        name="notes"
                                        :disabled='isUpdated'
                                        placeholder="Uwagi"
                                        rows="2"
                                        v-model="nPlanData.notes">
                                    </textarea>
                                </template>
                                <template v-else>
                                    <p class="small mb-0">
                                        <span class="text-muted">
                                            <i class="fe fe-message-square pr-2"></i>Uwagi:
                                        </span>
                                        {{ nPlanData.notes }}
                                    </p>
                                </template>
                            </div>
                        </div><!-- /card -->

                        <!-- breakpoint separator -->
                        <div class="w-100 d-lg-none mt-2"></div>

                        <div class="card card-content card-content--extras shadow-sm">
                            <div class="card-header">
                                <div class="card-icon bg-primary shadow">
                                    <i class="fe fe-calendar h2"></i>
                                </div>
                                <p class="card-category text-right">Plan na dzień</p>
                                <h3 class="card-title">{{ nPlanData.planDate.substring(0,10) }}</h3>
                            </div>
                            <div class="card-body py-2 d-flex align-items-center">
                                <i class="fe fe-clock text-warning"></i>
                                <span class="text-warning ml-2">
                                    Termin złożenia planu mija <strong>{{ nPlanData.contractDetails.dayToSendNutritionPlan }}</strong>
                                </span>
                            </div>
                        </div><!-- /card -->
                    </div><!-- /card deck -->
                </div><!-- /col-12 -->
            </div><!-- /row -->

            <div class="row">
                <div class="col-md-12">
                    <h5 class="mt-4">Lista</h5>
                    <div class="table-responsive">
                        <template v-if="nPlanData.contractDetails === null">
                            <p class="text-center font-weight-bold">Brak aktywnej umowy</p>
                        </template>
                        <template v-else-if="nPlanData.contractDetails">
                            <table class="table table--grid table-striped table-bordered  table-sm">
                                <thead class="thead-light">
                                    <tr class="d-flex">
                                        <th class="col-3 align-bottom">Nazwa diety</th>
                                        <th class="col" :key='index' v-for="(cMeal, index) in nPlanData.contractDetails.contractMeals">
                                            {{ cMeal.meal.name }}<br/>
                                            <span class="small">Korekta do godz.: {{ cMeal.timeToCorrect ? cMeal.timeToCorrect.substring(11,16) : null}}</span>
                                            <div v-if="!canEditPlanValues || !allowToEdit" class="row mx-0">
                                                <div class="col pl-0">Plan</div>
                                                <div class="col pr-0">Korekta</div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-for="cDiet in nPlanData.nourishedPlanDiets">
                                        <tr class="d-flex">
                                            <td class="col-3">
                                                <div style='height: 100%; display: flex; align-items: center;'>
                                                    <span v-if='cDiet.diet.color' style='min-width:10px; margin-right:5px; display:inline-block; width:10px;height:10px; border-radius:50%' :style='{backgroundColor: cDiet.diet.color}'></span>  
                                                    {{ cDiet.diet.name }} {{ cDiet.diet.isSpecial ? '(Specjalna)' : null }}
                                                </div>
                                            </td>
                                            <template v-if="cDiet.activeMenu.uuid === undefined">
                                                <td class="text-center font-italic text-warning col"
                                                    :colspan="nPlanData.contractDetails.contractMeals.length">
                                                    Brak aktywnego menu dla tej diety.
                                                </td>
                                            </template>
                                            <template v-else>
                                                <td
                                                    v-for="(cMeal, index) in nPlanData.contractDetails.contractMeals"
                                                    :key='index'
                                                    class="col">

                                                    <template v-if="!cDiet.hasOwnProperty('nourishedPlanPositions')">
                                                        <div class="w-100 align-bottom small font-italic"> </div>
                                                    </template>
                                                    <template v-else-if="computedPositions[cDiet.uuid].nourishedPlanPositions[cMeal.meal.uuid] !== undefined ">
                                                        <template v-if="canEditPlanValues && allowToEdit">
                                                            <TableInput
                                                                :correction='false'
                                                                :peopleNumber ='computedPositions[cDiet.uuid].nourishedPlanPositions[cMeal.meal.uuid].peopleNumber'
                                                                :uuid='cMeal.meal.uuid'
                                                                :computedPositions='computedPositions'
                                                                :diet='cDiet'
                                                                >
                                                            </TableInput>
                                                        </template>
                                                        <template v-else>
                                                            <div class="row mx-0">
                                                                <div class="col pl-0">
                                                                    <div class="w-100 no-input">
                                                                        {{ computedPositions[cDiet.uuid].nourishedPlanPositions[cMeal.meal.uuid].peopleNumber }}
                                                                        &nbsp;
                                                                    </div>
                                                                </div>
                                                                <div class="col pr-0">
                                                                    <template  v-if="new Date(cMeal.dayToCorrectNutritionPlan) > serverTime && allowToEdit">
                                                                        <TableInput
                                                                            :correction='true'
                                                                            :correctionValue='computedPositions[cDiet.uuid].nourishedPlanPositions[cMeal.meal.uuid].correction'
                                                                            :uuid='cMeal.meal.uuid'
                                                                            :computedPositions='computedPositions'
                                                                            :diet='cDiet'>
                                                                        </TableInput>
                                                                    </template>
                                                                    <template v-else>
                                                                        <div class="w-100 no-input">
                                                                            {{ computedPositions[cDiet.uuid].nourishedPlanPositions[cMeal.meal.uuid].correction }}
                                                                            &nbsp;
                                                                        </div>
                                                                    </template>
                                                                </div>
                                                            </div>
                                                        </template>
                                                    </template>
                                                    <template v-else>
                                                        <div class="w-100 align-bottom small font-italic"> </div>
                                                    </template>
                                                </td>
                                            </template>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </template>
                        <template v-else>
                            <div class="loader"></div>
                        </template>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <p class="small mb-0">
                        <span class="text-muted">Data utworzenia:</span>
                        {{ nPlanData.createdAt }}
                    </p>
                    <p class="small">
                        <span class="text-muted">Data modyfikacji:</span>
                        {{ nPlanData.updatedAt }}
                    </p>
                </div>
                <div class="col-md-6 text-right">
                    <button
                        v-if="!nPlanData.status && allowToEdit"
                        @click="updateAndClose"
                        class="basic-info__add-btn" >
                            Zakończ
                    </button>
                </div>
            </div>
        </template>

        <template v-else>
            <div class="loader"></div>
        </template>

        <div v-if="isUpdated" class='loader-container'>
            <div  class="loader loader--fixed"></div>
        </div>
    </div><!-- /container-fluid -->
</template>

<script>
import 'vue-datetime/dist/vue-datetime.css';
import jwtDecode from 'jwt-decode';
import { EventBus } from '../../main.js';
import TableInput from '../TableInput.vue';
export default {
  props: ['createForFewDays'],
  components: {
    TableInput,
  },
  data: function () {
    return {
      config: null,
      nPlanData: [],
      serverTime: null,
      edit: true,
      nPlanPositionIndex: null,
      isUpdated: false,
      plan: null,
      granted_edit: 0,
    };
  },
  created: function () {
    const token = localStorage.getItem('token');
    const decoded = token !== null ? jwtDecode(token) : null;

    if (decoded !== null) {
      if (decoded.roles.includes('ROLE_AS_NOURISHED_PLAN_ADD_EDIT')) {
        this.granted_edit = 1;
      } else {
        this.granted_edit = 0;
      }
    } else {
      this.$router.push('login');
    }

    this.plan = this.$route.params.id;
    this.getDataOnCreation();

    EventBus.$on('startUpdating', (type) => {
      if (type === 'start') {
        this.isUpdated = true;
      } else {
        this.isUpdated = false;
      }
    });

    EventBus.$on('newPositionValue',({response, diet, uuid})=>{
        this.computedPositions[diet.uuid].nourishedPlanPositions[uuid] = response.data;
    });
  },
  computed: {
    canEditPlanValues: function () {
      if (this.nPlanData !== null && this.serverTime !== null) {
        const maxPlanDate = new Date(this.nPlanData.contractDetails.dayToSendNutritionPlan);
        return this.nPlanData.status === true ? false : maxPlanDate > this.serverTime;
      } else {
        return null;
      }
    },
    allowToEdit: function() {
      return this.granted_edit === 1;
    },
    generatedDays: function() {
      if (this.nPlanData !== null) {
        const planDate = new Date(this.nPlanData.planDate);
        const lastPossibleDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7);
        const howManyDays = (lastPossibleDate - planDate) / 1000 / 3600 / 24;
        return howManyDays > 7 ? 7 : howManyDays;
      } else {
        return null;
      }
    },
    computedPositions: function () {
      let arrayReduced = [];

      if (this.nPlanData) {
        arrayReduced = this.nPlanData.nourishedPlanDiets.reduce((obj, item) => {
          obj[item.uuid] = item;
          if (item.nourishedPlanPositions) {
            item.nourishedPlanPositions = item.nourishedPlanPositions.reduce((posObj, posItem) => {
              posObj[posItem.menuMeal.dMeal.uuid] = posItem;
              return posObj;
            }, {});
          }
          return obj;
        }, {});
      }
      return arrayReduced;
    },
  },
  methods: {
    getDataOnCreation: function () {
      this.$Progress.start();

      this.$http.get('/api/app/server_time')
        .then(response => {
          this.serverTime = new Date(response.data);
        }).catch(error => {
          this.$Progress.fail();
          console.error('Error:', error);
        });

      this.$http.get('/api/app/nourished_plans/' + this.plan + '?context=nourishedPlan')
        .then(response => {
          this.$Progress.finish();
          this.nPlanData = response.data;
        })
        .catch(error => {
          this.$Progress.fail();
          console.error('Error:', error);
        });
    },
    updateDocument: function(dataToSend, myCallback) {
      this.isUpdated = true;
      this.$Progress.start();

      this.$http.put('/api/app/nourished_plans/' + this.nPlanData.uuid + '?context=nourishedPlan', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          this.$Progress.finish();
          EventBus.$emit('triggerAlert', { message: 'Plan został zaktualizowany poprawnie.', type: 'updateDocument' });
          this.nPlanData = response.data;

          this.isUpdated = false;
        })
        .catch(error => {
          this.$Progress.fail();
          console.error('Error:', error);
          this.isUpdated = false;
        });
    },
    updateAndClose: function() {
      const dataToSend = {
        'notes': this.nPlanData.notes,
      };
      this.updateDocument(dataToSend);
    },
    createPlanForFewDays: function () {
      this.$Progress.start();
      this.isUpdated = true;

      this.$http.post('/api/app/nourished_plans/' + this.nPlanData.uuid + '/create_for_few_days?howManyDays=' + this.createForFewDays + '&context=nourishedPlan', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          this.$Progress.finish();
          EventBus.$emit('triggerAlert', { message: 'Plany zostały utworzone poprawnie.', triggerManualError: false, type: 'planIsCreated' });
          this.isUpdated = false;
        })
        .catch(error => {
          this.$Progress.fail();
          this.isUpdated = false;
          console.error('Error:', error);
        });
    },
  },
  watch: {
    '$route'() {
      this.plan = this.$route.params.id;
      this.nPlanData = [];
      this.serverTime = null;
      this.getDataOnCreation();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../css/variables';
@import '../../css/scoped-forms';

.no-input {
    background-color: #ebebeb;
    border-radius: 5px;
    border: 1px solid $form-input-border-col;
    padding: 3px 0 3px 10px;
}

input, textarea {
    background-color: white !important;
    // border-style: none;
    // color: inherit;
}
.form__select {
    appearance: initial;
    background-color: white !important;
    -webkit-appearance: menulist;
}
</style>
