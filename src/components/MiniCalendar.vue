<template>
    <div class="container-fluid" style='padding-top: 20px; padding-bottom: 20px;' data-app >
        <vue-progress-bar></vue-progress-bar>
        <template v-if='selectedDepartment == null'>
            <div class="user-block" style="margin: 0 auto;">
                <div class="select-department" style="text-align: center;">
                    <h3>Wybierz odział</h3>
                    <SelectDepartment type='transparent'></SelectDepartment>
                </div>
            </div>
        </template>
        <template v-else-if='plans === null'>
            <div class="loader"></div>
        </template>
        <template v-else>
            <div class="row">
                <div class="mini-calendar col-12">
                    <div class="settings">
                        <div>Idź do <button @click='goToToday'>DZISIAJ</button></div>
                        <div>
                            <span>Utwórz na kolejnych: </span>
                            <select v-model='createPlanForSeveralDays'>
                                <option value=1>1 dni</option>
                                <option value=2>2 dni</option>
                                <option value=3>3 dni</option>
                                <option value=4>4 dni</option>
                                <option value=5>5 dni</option>
                                <option value=6>6 dni</option>
                                <option value=7>7 dni</option>
                            </select>
                            <button @click='createForFewDays(createPlanForSeveralDays)'>
                                Utwórz
                            </button>
                        </div>
                    </div>

                    <div class='week-container' id='week-container'>
                        <button @click='scrollLeftRight("left")'>
                            <img src='./../static/images/icons/actions-general/arrow-down-black.png' alt="arrow">
                        </button>
                        <div class="week" id='week'>

                            <div class="week-day" v-for='day in daysGenerator("before")' >
                                <span class='month-name' v-if='isFirstDay(day)'>{{day.getMonth() | showMonthName}} {{day.getFullYear()}}</span>
                                <span class='day-name'>{{day.getDay() | showDayOfWeek}}</span>
                                <template v-if='isPlanForDay(day)'>
                                    <router-link style='cursor:pointer;' :to='`${planId(day)}`' class="day-date" :tag='"div"'>
                                        <span>
                                            {{day.getDate()}}<small>{{day.getMonth() | filterMonthNumber}}</small>
                                            <i class='fe fe-check'/>
                                        </span>
                                    </router-link>
                                </template>
                                <template v-else>
                                    <div class="day-date">
                                        <span>
                                            {{day.getDate()}}<small>{{day.getMonth() | filterMonthNumber}}</small>
                                        </span>
                                    </div>
                                </template>
                            </div>
                            <div class="week-day" v-for='day in daysGenerator("after")'>
                                <span class='month-name' v-if='isFirstDay(day)'>{{day.getMonth() | showMonthName}} {{day.getFullYear()}}</span>
                                <span class='day-name'>{{day.getDay() | showDayOfWeek}}</span>
                                <template v-if='isPlanForDay(day)'>
                                    <router-link v-if='activeDay(day)' ref='myActiveDay' style='cursor:pointer;' :to='`${planId(day)}`' class='day-date' :class='{"day-active": activeDay(day), "editable-day": editableDay(day)}' :tag='"div"'>
                                        <span>
                                            {{day.getDate()}}<small>{{day.getMonth() | filterMonthNumber}}</small>
                                            <i class='fe fe-check'/>
                                        </span>
                                    </router-link>
                                    <router-link v-else style='cursor:pointer;' :to='`${planId(day)}`' class='day-date' :class='{"day-active": activeDay(day), "editable-day": editableDay(day)}' :tag='"div"'>
                                        <span>
                                            {{day.getDate()}}<small>{{day.getMonth() | filterMonthNumber}}</small>
                                            <i class='fe fe-check'/>
                                        </span>
                                    </router-link>
                                </template>

                                <template v-else>
                                    <div
                                        v-if='editableDay(day)'
                                        @click='changeSelectedDay(day)'
                                        style='cursor:pointer;'
                                        class='day-date'
                                        :class='{"day-active": activeDay(day), "editable-day": true}'>
                                        <span>
                                            {{day.getDate()}}<small>{{day.getMonth() | filterMonthNumber}}</small>
                                        </span>
                                    </div>
                                    <div v-else class='day-date' :class='{"day-active": activeDay(day)}'>
                                        <span>
                                            {{day.getDate()}}<small>{{day.getMonth() | filterMonthNumber}}</small>
                                        </span>
                                    </div>
                                </template>
                            </div>

                        </div>
                        <button @click='scrollLeftRight("right")'>
                            <img src='./../static/images/icons/actions-general/arrow-down-black.png' alt="arrow">
                        </button>
                    </div>
                    
                </div>
                <v-dialog v-model="dialog" max-width="490">
                    <v-card>
                        <v-card-title class="headline">Utworzenie nowego planu żywienia</v-card-title>

                        <v-card-text :style='{textAlign: "left"}'>
                            Uwaga! Nie istnieje plan żywionych dla wybranego dnia. Czy chcesz utworzyć nowy plan? <br/>
                            <!-- <input type="checkbox" v-model='fillWithLastPlanData'> -->

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

                <router-view :createForFewDays='createPlanForSeveralDays'></router-view>

                <div class="mini-calendar-legend">
                    <div class='legend-day'>
                        <div class="day-date day-active">
                            <span>
                                1<small>.01</small>
                            </span>
                        </div>
                            - dzień dzisiejszy
                    </div>
                    <div class='legend-day'>
                        <div class="day-date editable-day">
                            <span>
                                1<small>.01</small>
                            </span>
                        </div>
                            - dzień na który możliwe jest utworzenie planu żywienia
                    </div>
                    <div class='legend-day'>
                        <div class="day-date editable-day">
                            <span>
                                1<small>.01</small>
                                <i class='fe fe-check'/>
                            </span>
                        </div>
                            -  dzień w którym już istnieje plan żywienia
                    </div>

                </div>
            </div>
        </template>
        <custom-alert></custom-alert>
    </div>
</template>

<script>
import { EventBus } from '../main.js';
import Alert from './Alert.vue';
import SelectDepartment from './SelectDepartment.vue';
export default {
  props: ['department', 'freshPlans'],
  components: {
    'custom-alert': Alert,
    SelectDepartment,
  },
  data() {
    return {
      today: new Date(),
      plans: null,
      selectedDepartment: null,
      updatedCounter: 0,
      selectedDay: null,
      dialog: false,
      createPlanForSeveralDays: 1,
      fillWithLastPlanData: false,
      weekWidth: 0,
    };
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
    this.getDataOnCreation();
  },
  filters: {
    showDayOfWeek(value) {
      switch (value) {
        case 0: return 'Niedziela';
        case 1: return 'Poniedziałek';
        case 2: return 'Wtorek';
        case 3: return 'Środa';
        case 4: return 'Czwartek';
        case 5: return 'Piątek';
        case 6: return 'Sobota';
        case 7: return 'Niedziela';
      }
    },
    filterMonthNumber(value) {
      switch (value) {
        case 0: return '.01';
        case 1: return '.02';
        case 2: return '.03';
        case 3: return '.04';
        case 4: return '.05';
        case 5: return '.06';
        case 6: return '.07';
        case 7: return '.08';
        case 8: return '.09';
        case 9: return '.10';
        case 10: return '.11';
        case 11: return '.12';
      }
    },
    showMonthName(value) {
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
  methods: {
    async getDataOnCreation() {
      if (this.department !== undefined) {
        this.selectedDepartment = this.department;
        this.plans = null;
        this.$Progress.start();
        await this.$http.get(`/api/app/nourished_plans?companyDepartment.uuid=${this.selectedDepartment}&context=nourishedPlanGrid`).then(response => {
          this.$Progress.finish();
          this.plans = response.data['hydra:member'];
        })
          .catch(() => {
            this.$Progress.fail();
          });
        // eslint-disable-next-line
        const myEl = $('.week-container .day-active')[0];
        // eslint-disable-next-line
        $(myEl).attr('tabindex', -1).focus();
        // eslint-disable-next-line
        if ($('.week')[0]) {
          // eslint-disable-next-line
          this.weekWidth = $('.week')[0].scrollLeft;
          // eslint-disable-next-line
          localStorage.setItem('calendarWidth', this.weekWidth);
        }
      }
    },
    daysGenerator(type) {
      const daysAfter = [];
      if (type === 'before') {
        for (let i = 1; i <= 14; i++) {
          const nextDay = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - i);
          daysAfter.push(nextDay);
        }
        daysAfter.reverse();
      } else {
        for (let i = 0; i <= 14; i++) {
          const nextDay = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + i);
          daysAfter.push(nextDay);
        }
      }
      return daysAfter;
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
    scrollLeftRight(type) {
      const scrollContainer = document.getElementById('week');
      if (type === 'right') {
        $('.week').animate({ scrollLeft: scrollContainer.scrollLeft + 250 }, 300);
      } else {
        if (scrollContainer.scrollLeft > 0) {
          $('.week').animate({ scrollLeft: scrollContainer.scrollLeft - 250 }, 300);
        }
      }
    },
    isPlanForDay(date) {
      for (const value of this.plans) {
        if (new Date(value.planDate).toString() === date.toString()) {
          return true;
        }
      }
    },
    planId(day) {
      for (const value of this.plans) {
        if (new Date(value.planDate).toString() === day.toString()) {
          const string = `/plans/show/${value.uuid}`;
          return string;
        }
      }
    },
    editableDay(day) {
      if (new Date(day).setHours(0, 0, 0, 0) === new Date(this.today).setHours(0, 0, 0, 0)) {
        return true;
      } else {
        if (day <= new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 7)) {
          return true;
        }
      }
    },
    goToToday() {
      const width = localStorage.getItem('calendarWidth');
      $('.week').animate({ scrollLeft: width }, 500);
    },
    isFirstDay(day) {
      const firstDay = new Date(day.getFullYear(), day.getMonth(), 1);
      return firstDay.toString() === day.toString();
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
    changeSelectedDay(day) {
      this.selectedDay = new Date(day);
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
        this.plans.push(response.data);
        this.fillWithLastPlanData = false;
        this.$router.push('/plans/show/' + response.data.uuid);
      }).catch(error => {
        this.$Progress.fail();
        console.error('Error:', error);
      });
    },
    createForFewDays(daysNumber) {
      if (this.$route.params.id) {
        const url = `/api/app/nourished_plans/${this.$route.params.id}/create_for_few_days?context=nourishedPlan&howManyDays=${daysNumber}`;

        this.$Progress.start();
        this.$http.post(url).then(response => {
          EventBus.$emit('triggerAlert', { message: 'Plany zostały utworzne pomyślnie', type: 'createForFewDays' });
          this.$Progress.finish();
          this.plans = [...this.plans, ...response.data['hydra:member']];
        }).catch(error => {
          this.$Progress.fail();
          console.error('Error:', error);
        });
      } else {
        EventBus.$emit('triggerAlert', { message: 'Musisz wybrać plan', triggerManualError: true, type: 'planMustBeSelected' });
        // EventBus.$emit('fetchError', error);
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
      this.$router.push('/plans');
      this.getDataOnCreation();
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
.mini-calendar-legend {
    display: flex;
    flex-direction: column;
    // margin-top: 20px;
    .legend-day {
        display: flex;
        align-items: center;
        // width: 70px;
        margin:0 10px 10px 10px;
        .month-name {
            font-size: 1.5em;
            font-weight: 700;
        }
        .day-name {
            display:block;
            font-weight: bolder;
            margin-bottom: 10px;
        }
        .day-date {
            display: flex;
            flex-direction: column;
            justify-content: center;
            background-color: #EAECF6;
            color: #3C3C42;
            font-weight: bold;
            // padding: 10px 10px 10px 15px;
            padding: 0 10px;
            width:70px;
            margin-right:10px;
            height: 45px;
            border-radius: 5px;
            small {
                font-size: 60%;
                font-weight: 700;
            }
            span {
                font-size: 1.3em;
                position: relative;
            }
            i {
                font-size: 20px;
                position: absolute;
            }
        }
        .day-active {
            background-color: #00BAFF !important;
            color: white;
        }
        .editable-day {
            background-color:#96E3FF;
            cursor:pointer;
        }
    }
}
.mini-calendar {
    margin-bottom:25px;
}
.settings {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    button {
        background-color:transparent;
        border:none;
        color:$action-color;
        cursor:pointer;
        font-weight: bolder;
        border: 2px solid $action-color;
        padding: 3px 8px;
        border-radius: 5px;
    }
    span {
        font-weight: normal;
        margin-right:10px;
    }
    select {
        min-width:200px;
        appearance: none;
        background-color:transparent;
        margin-right: 10px;
        border-radius: 5px;
        border: 1px solid #c4c0d8;
        background: #342f81;
        padding: 5px 1.75rem 5px 0.5rem;
        background: url('../static/images/icons/actions-general/arrow-down-black.png');
        background-repeat: no-repeat;
        background-position: center right;
        background-position-x: 95%;
        padding: 2px 7px;
        border-color: #7a71a7;
        padding-right: 30px;
    }
}
.week-container {
display:flex;
align-items: flex-end;
&>button {
        height: 60px;
        border-radius:4px;
        background-color:#EAECF6;
        border:none;
        padding: 0 2px;
        margin-bottom: 17px;
        cursor:pointer;
        &:first-child {
            margin-right:20px;
            img {
                transform:rotate(90deg);
            }
        }
        &:last-child {
            margin-left:20px;
            img {
                transform:rotate(-90deg);
            }
        }
    }
}
.week {
    display: grid;
    grid-template-columns: auto;
    grid-auto-flow: column;
    align-items: end;
    justify-items: center;
    overflow: auto;
    margin-top: 20px;
    position:relative;
    padding-bottom:10px;
    // &::-webkit-scrollbar {
    //     display:none;
    // }
    &::-webkit-scrollbar {
        height:7px;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: #00BAFF;
    }
    &::-webkit-scrollbar-button {
        display:none;
    }
}
.week-day {
    display: inline-block;
    width: 120px;
    margin:0 10px;
    .month-name {
        font-size: 1.5em;
        font-weight: 700;
    }
    .day-name {
        display:block;
        font-weight: bolder;
        margin-bottom: 10px;
    }
    .day-date {
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: #EAECF6;
        color: #3C3C42;
        font-weight: bold;
        // padding: 10px 10px 10px 15px;
        padding: 0 15px;
        height: 60px;
        border-radius: 5px;
        small {
            font-size: 60%;
            font-weight: 700;
        }
        span {
            font-size: 1.5em;
            position: relative;
        }
        i {
            font-size: 20px;
            position: absolute;
        }
    }
    .day-active {
        background-color: #00BAFF !important;
        color: white;
    }
    .editable-day {
        background-color:#96E3FF;
        cursor:pointer;
    }
}
.router-link-active {
    border:1px solid $dark-bg-col;
}
</style>
