<template>
    <nav class="top-header">
        <vue-progress-bar></vue-progress-bar>
        <div class="logo-nav-block">
            <router-link to='/' tag='a'>
                <img class='logo-nav-block__logo' src="../static/images/logo-imfood.jpg" alt="imFood logo">
            </router-link>

            <ul class='main-navigation'>
                <li class="main-navigation__element">
                    <router-link exact active-class="main-navigation__element--active" class="main-navigation__link" to='/'>
                        <i class="icon-kalendarz"></i>
                        Kalendarz
                    </router-link>
                </li>

                <li class="main-navigation__element">
                    <router-link active-class="main-navigation__element--active" class="main-navigation__link" to='/diets'>
                        <i class="icon-diety"></i>
                        Jadłospisy
                    </router-link>
                </li>

                <li class="main-navigation__element">
                    <router-link  active-class="main-navigation__element--active" class="main-navigation__link " to='/plans' >
                        <i class="icon-plany-zywionych"></i>
                        Plany żywionych
                    </router-link>
                </li>
            </ul>
        </div>
        <div class="user-block">
            <SelectDepartment
                :departments='departments'
                :decoded='decoded'
            ></SelectDepartment>
            <div class="user-nav-manipulation">
                <div class="dropdown dropleft" style='display: flex;'>
                    <button class="dropdown-toggle"  id="dropdownMenuButton" data-toggle="dropdown" :aria-haspopup="true" aria-expanded="false">
                        <a href="#" class='user-block__bell'>
                            <i class='fe fe-bell' :class='{"red-bell" : numberOfNewPlans !== null}'></i>
                            <span class='alert-circle' :class='{"alert-circle--invisible": numberOfNewPlans == null}'> ! </span>
                        </a>

                    </button>
                    <div class="dropdown-menu nav-dropdown" :class='{"dropdown--zero-padding": numberOfNewPlans !== null}' aria-labelledby="dropdownMenuButton">
                        <div v-if='numberOfNewPlans == null'>
                            <p>Brak zmian</p>
                        </div>
                        <div v-else>
                            <p>Uwaga! Masz {{this.numberOfNewPlans}} nowe plany.</p>
                            <a class="btn btn-primary w-100" href="#" @click='getNewPlans'>Pobierz nowe dane</a>
                        </div>
                    </div>
                </div>

                <div class="pipe"></div>
                <a @click='logOut' href="" class='user-block__user'>
                    <i class='fe fe-log-out'></i>
                </a>
            </div>
        </div>
    </nav>
</template>

<script>
import { EventBus } from '../main.js';
import SelectDepartment from './SelectDepartment.vue';
import jwtDecode from 'jwt-decode';
export default {
  props: ['changeDepartment'],
  components: {
    SelectDepartment,
  },
  data() {
    return {
      departments: null,
      selectedDepartment: '',
      token: null,
      decoded: null,
      numberOfNewPlans: null,
    };
  },
  created() {
    EventBus.$on('gotNewPlans', (plansNumber) => {
      this.numberOfNewPlans = plansNumber;
    });
    EventBus.$on('plansAreEqual', () => {
      this.numberOfNewPlans = null;
    });
    EventBus.$on('changeDepartmentFromComponent', (newId) => {
      this.selectedDepartment = newId;
    });
    this.token = localStorage.getItem('token');
    this.decoded = this.token !== null ? jwtDecode(this.token) : null;
  },
  methods: {
    logOut() {
      localStorage.removeItem('token');
    },
    getNewPlans() {
      EventBus.$emit('getNewPlans');
    },
  },
  watch: {
    selectedDepartment() {
      localStorage.setItem(this.decoded.username, this.selectedDepartment);
      this.changeDepartment(this.selectedDepartment);
    },
  },
};
</script>

<style lang="scss">

#dropdownMenuButton {
    &:after, &:before {
        display:none;
    }
}
.dropdown {
    display: flex;
}
.dropdown-menu {
    transform: translate3d(-230px, 35px, 0px) !important;
    // background-color: #fcf7de !important;
    width: 250px;
    border-radius: 2px;
    color: black !important;
    padding-bottom:5px !important;
    & p {
        padding: 5px 15px;
        margin:0;
        text-align: center;
    }
    &:before {
        position: absolute;
        width: 10px;
        height: 10px;
        transform: rotate(45deg);
        background-color: white;
        content: '';
        top: -5px;
        right: 7px;
    }
}
.alert-circle {
    font-size: 35px;
    color: red;
    position: absolute;
    right: -8px;
    &--invisible{
        visibility: hidden;
    }
}
.red-bell {
    color: red;
}
.dropdown--zero-padding {
    padding-bottom:0 !important;
}

.loader-select {
    border-width: 3px !important;
    border-top: 3px solid #3498db !important;
    width: 20px !important;
    height: 20px !important;
}
</style>
