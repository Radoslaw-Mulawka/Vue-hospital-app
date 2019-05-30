<template>
    <div class="calendar" style='position:relative' data-app >
        <vue-progress-bar></vue-progress-bar>

        <template v-if='selectedDepartment == null'>
            <div class="user-block" style="margin: 0 auto;">
                <div class="select-department" style="text-align: center;">
                    <h3 style='margin-bottom: 20px;'>Wybierz odział</h3>
                    <SelectDepartment type='transparent'></SelectDepartment>
                </div>
            </div>
        </template>
        <template v-else-if='plans === null'>
            <div class="loader"></div>
        </template>

        <template v-else>
            <div class="calendar__head">
                <div class="month__regulator regulator">
                    <!-- <div class="regulator__pipe"></div> -->
                    <span class="regulator__today">Idź do <button @click='backToToday'>dzisiaj</button></span>
                </div>
                <div class="month">
                    <div class="month__switch">
                        <button @click='prevMonth' class="month__btn-previous"><i class="fe fe-chevron-left"></i></button>
                        <span class="month__name">{{new Date(combinedDate).getMonth() | showMonth}} {{new Date(combinedDate).getFullYear()}}</span>
                        <button class="month__btn-next" @click='nextMonth'><i class="fe fe-chevron-right"></i></button>
                    </div>

                </div>

                <!-- <div class="choose-month-duration">
                    <label for="choose-month-duration">Twórz na okres:</label>
                    <select  id="choose-month-duration">
                        <option>Dzisiaj</option>
                    </select>
                </div> -->
            </div>

            <div class="calendar__body">
                    <div class="calendar__week-days">
                        <div v-for='day in daysOfWeek' :key='day'>{{day}}</div>
                    </div>

                    <div class="calendar__week-squares">
                        <!-- <transition-group name="slide-fade"  tag='div' class="calendar__week-squares"> -->
                            <div :key='n*1.23456' v-for='n in fakeDaysCount' style='visibility:hidden;'></div>
                            <template v-for='day in daysGenerator'>
                                <div
                                    v-if='isPlanForDay(day)'
                                    :key='day.toString()'
                                    :class='{"visible-day":true}' >
                                    <router-link tag='span' :to='planId(day)' style='cursor:pointer;' :class='{"current-day": activeDay(day), "editable-day": editableDay(day)}'>{{day.getDate()}}
                                        <i class='fe fe-check'></i>
                                    </router-link>
                                </div>
                                <div
                                    v-else
                                    :key='day.toString()'
                                    :class='{"visible-day":true}'>

                                    <span v-if='editableDay(day) || activeDay(day)' @click='changeSelectedDay(day)'  style='cursor:pointer;' :class='{"current-day": activeDay(day), "editable-day": true}'>
                                        {{day.getDate()}}
                                    </span>

                                    <span v-else :class='{"current-day": activeDay(day)}'>
                                        {{day.getDate()}}
                                    </span>
                                </div>

                            </template>

                            <v-dialog v-model="dialog" max-width="490">
                                <v-card>
                                    <v-card-title class="headline">Utworzenie nowego planu żywienia</v-card-title>

                                    <v-card-text :style='{textAlign: "left"}'>
                                        Uwaga! Nie istnieje plan żywionych dla wybranego dnia. Czy chcesz utworzyć nowy plan?
                                        <div class="custom-control custom-checkbox my-1 mr-sm-2" style='margin-top:20px !important'>
                                            <input v-model='fillWithLastPlanData' type="checkbox" class="custom-control-input" id="customControlInline">
                                            <label class="custom-control-label" for="customControlInline">Uzupełnic plan danymi ostatniego zaakceptowanego planu?</label>
                                        </div>
                                    </v-card-text>

                                    <v-card-actions>
                                    <v-spacer></v-spacer>

                                    <v-btn
                                    color="green darken-1"
                                    flat="flat"
                                    @click="dialog = false">
                                        Zamknij
                                    </v-btn>

                                    <v-btn
                                    color="green darken-1"
                                    flat="flat"
                                    @click="createPlan(department, selectedDay)">
                                        Utwórz!
                                    </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                        <!-- </transition-group> -->
                    </div>
            </div>

            <div class='legend'>
                <div class="current-day-example ">
                    <span >1</span> - dzień dzisiejszy
                </div>
                <div class="editable-day-example ">
                    <span >1</span> - dzień na który możliwe jest utworzenie planu żywienia
                </div>
                <div class="plan-day-example ">
                    <span >
                        1 <i class='fe fe-check'></i>
                    </span>
                    -  dzień w którym już istnieje plan żywienia
                </div>
            </div>
        </template>
        <custom-alert></custom-alert>
    </div>
</template>

<script>
import { EventBus } from '../main.js';
import SelectDepartment from './SelectDepartment.vue';
import Alert from './Alert.vue';
export default {
  props: ['department', 'freshPlans'],
  components: {
    SelectDepartment,
    'custom-alert': Alert,
  },
  data() {
    return {
      dialog: false,
      daysOfWeek: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'],
      plans: null,
      year: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      firstDay: null,
      lastDay: null,
      combinedDate: null,
      selectedDepartment: null,
      fillWithLastPlanData: false,
      selectedDay: null,
    };
  },
  filters: {
    showMonth(value) {
      switch (value) {
        case 0: return 'Styczeń';
        case 1: return 'Luty';
        case 2: return 'Marzec';
        case 3: return 'Kwiecień';
        case 4: return 'Maj';
        case 5: return 'Czerwiec';
        case 6: return 'Lipiec';
        case 7: return 'Sierpień';
        case 8: return 'Wrzesień';
        case 9: return 'Październik';
        case 10: return 'Listopad';
        case 11: return 'Grudzień';
      }
    },
  },
  created() {
    EventBus.$on('getNewPlans', () => {
      if (this.department !== undefined) {
        this.selectedDepartment = this.department;
        this.plans = null;
        this.$Progress.start();
        this.$http.get(`/api/app/nourished_plans?companyDepartment.uuid=${this.selectedDepartment}&context=nourishedPlanGrid`).then(response => {
          this.$Progress.finish();
          this.plans = response.data['hydra:member'];
          EventBus.$emit('plansAreEqual');
        }).catch(() => {
          this.$Progress.fail();
        });
      }
    });
    if (this.department !== undefined) {
      this.selectedDepartment = this.department;
      this.plans = null;
      this.$Progress.start();
      this.$http.get(`/api/app/nourished_plans?companyDepartment.uuid=${this.selectedDepartment}&context=nourishedPlanGrid`).then(response => {
        this.$Progress.finish();
        this.plans = response.data['hydra:member'];
      }).catch(() => {
        this.$Progress.fail();
      });
    }

    const date = new Date();
    this.month = date.getMonth();
    this.firstDay = new Date(date.getFullYear(), this.month, 1);
    this.lastDay = new Date(date.getFullYear(), this.month + 1, 0);

    this.combinedDate = new Date().setFullYear(this.year, this.currentMonth, 1);
  },
  methods: {
    changeSelectedDay(day) {
      this.selectedDay = new Date(day);
    },
    nextMonth() {
      const newDate = new Date(new Date(this.combinedDate).getFullYear(), new Date(this.combinedDate).getMonth() + 1, 1);

      const month = newDate.getMonth();
      const firstDay = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);

      this.currentMonth = month;
      this.firstDay = firstDay;
      this.lastDay = lastDay;

      this.combinedDate = newDate;
    },
    prevMonth() {
      const newDate = new Date(new Date(this.combinedDate).getFullYear(), new Date(this.combinedDate).getMonth() - 1, 1);

      const month = newDate.getMonth();
      const firstDay = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);

      this.currentMonth = month;
      this.firstDay = firstDay;
      this.lastDay = lastDay;

      this.combinedDate = newDate;
    },
    isPlanForDay(date) {
      for (const value of this.plans) {
        if (new Date(value.planDate).toString() === date.toString()) {
          return true;
        }
      }
    },
    activeDay(date) {
      const resetedDate = new Date();
      resetedDate.setHours(0);
      resetedDate.setMinutes(0);
      resetedDate.setSeconds(0);
      if (date.toString() === resetedDate.toString()) {
        return true;
      }
    },
    backToToday() {
      const date = new Date();
      this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      this.lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      this.combinedDate = new Date().setFullYear(date.getFullYear(), date.getMonth(), 1);
    },
    planId(day) {
      for (const value of this.plans) {
        if (new Date(value.planDate).toString() === day.toString()) {
          return `/plans/show/${value.uuid}`;
        }
      }
    },
    editableDay(day) {
      switch (day - new Date().setHours(0, 0, 0, 0)) {
        case 86400000: return true;
        case 172800000: return true;
        case 259200000: return true;
        case 345600000: return true;
        case 432000000: return true;
        case 518400000: return true;
        case 604800000: return true;
      }
    },
    createPlan(department, day) {
      this.dialog = false;

      const url = this.fillWithLastPlanData === true
        ? `/api/app/nourished_plans?context=nourishedPlan&fillLastPlanData=true`
        : `/api/app/nourished_plans?context=nourishedPlan`;
      this.$Progress.start();
      this.$http.post(url, {
        companyDepartment: '/api/company_departments/' + this.department,
        planDate: `${new Date(day).getFullYear()}-${this.monthNumber(new Date(day).getMonth())}-${new Date(day).getDate() >= 10 ? new Date(day).getDate() : '0' + new Date(day).getDate()}`,
      }).then(response => {
        this.$Progress.finish();
        EventBus.$emit('triggerAlert', { message: 'Plan został utworzny pomyślnie', type: 'createPlan' });
        this.fillWithLastPlanData = false;
        this.$router.push('/plans/show/' + response.data.uuid);
      }).catch(() => {
        this.$Progress.fail();
      });
    },
    monthNumber(value) {
      switch (value) {
        case 0: return '01';
        case 1: return '02';
        case 2: return '03';
        case 3: return '04';
        case 4: return '05';
        case 5: return '06';
        case 6: return '07';
        case 7: return '08';
        case 8: return '09';
        case 9: return '10';
        case 10: return '11';
        case 11: return '12';
      }
    },
  },
  computed: {
    daysGenerator() {
      const currentlySelectedDate = new Date(this.combinedDate);
      const lastDay = new Date(currentlySelectedDate.getFullYear(), currentlySelectedDate.getMonth() + 1, 0);

      const generatedDays = [];
      for (let i = 1; i <= lastDay.getDate(); i++) {
        generatedDays.push(new Date(currentlySelectedDate.getFullYear(), currentlySelectedDate.getMonth(), i));
      }
      return generatedDays;
    },
    fakeDaysCount() {
      if (this.firstDay.getDay() !== 0) {
        return this.firstDay.getDay() - 1;
      } else {
        return this.firstDay.getDay();
      }
    },
  },
  watch: {
    selectedDay() {
      if (this.plans.length > 0) {
        for (const value of this.plans) {
          if (new Date(value.planDate).toString() === this.selectedDay.toString()) {
            return true;
          } else {
            this.dialog = true;
          }
        }
      } else {
        this.dialog = true;
      }
    },
    department() {
      this.selectedDepartment = this.department;
      this.plans = null;
      this.$Progress.start();
      this.$http.get(`/api/app/nourished_plans?companyDepartment.uuid=${this.selectedDepartment}&context=nourishedPlanGrid`).then(response => {
        this.$Progress.finish();
        this.plans = response.data['hydra:member'];
      }).catch(() => {
        this.$Progress.fail();
      });
    },
    freshPlans() {
      if (this.freshPlans.length - this.plans.length > 0) {
        EventBus.$emit('gotNewPlans', this.freshPlans.length - this.plans.length);
      } else {
        EventBus.$emit('plansAreEqual');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../css/variables';
// .slide-fade-enter-active {
//   transition: all 2s ease;
// }
// .slide-fade-leave-active {
//   transition: all 0.3s ease;
// }
// .slide-fade-enter {
//     opacity: 0;
//     transform: translateY(20px);
// }
// .slide-fade-enter-to {
//     opacity:1;
//     transform:  translateY(0);
// }
// .slide-fade-leave {
//     opacity:0;
// }
// .slide-fade-leave-to {
//     opacity:1;
// }
// .slide-fade-enter, .slide-fade-leave-to
// /* .slide-fade-leave-active for <2.1.8 */ {
//   opacity: 0;
// }
.editable-day {
    color: $action-color;
}
</style>
