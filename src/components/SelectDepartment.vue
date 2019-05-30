<template>
    <div class="select-department" :class='{"transparentSelect": type=="transparent"}'>
        <template v-if='departments !==null '>
            <select v-model='selectedDepartment'>
                <option disabled value="">Wybierz oddział</option>
                <option :value='department.uuid' v-for='department in departments'>{{department.name}}</option>
            </select>
        </template>
        <template v-else-if='departments !==null && departments.length==1'>
            <select v-model='selectedDepartment'>
                <option disabled value="">Wybierz oddział</option>
                <option :value='departments[0].uuid' >{{departments[0].name}}</option>
            </select>
        </template>
        <template v-else>
            <div class="loader loader-select"></div>
        </template>
    </div>
</template>

<script>
import { EventBus } from '../main';
export default {
  props: ['decoded', 'type'],
  data() {
    return {
      departments: null,
      selectedDepartment: '',
    };
  },
  created() {
    EventBus.$on('changeDepartmentFromComponent', (newId) => {
      this.selectedDepartment = newId;
    });
    this.$Progress.start();
    this.$http.get('api/app/company_departments/user_departments?context=companyDepartmentGrid').then(response => {
      this.departments = response.data['hydra:member'];
      this.$Progress.finish();

      if (localStorage.getItem(this.decoded.username)) {
        if (this.departments.length > 1) {
          for (const department of this.departments) {
            if (department.uuid === localStorage.getItem(this.decoded.username)) {
              this.selectedDepartment = department.uuid;
            }
          }
        } else {
          this.selectedDepartment = this.departments[0].uuid;
        }
      }
      if (this.departments.length === 1 && !localStorage.getItem(this.decoded.username)) {
        this.selectedDepartment = this.departments[0].uuid;
      }
    }).catch(() => {
      this.$Progress.fail();
    });
  },
  watch: {
    selectedDepartment() {
      EventBus.$emit('changeDepartmentFromComponent', this.selectedDepartment);
    },
  },
};
</script>

<style lang="scss">
.transparentSelect {
    margin-right:0 !important;
    &>select {
        background: url('../static/images/icons/actions-general/arrow-down-black.png') transparent right .5rem center no-repeat !important;
        color: black !important;
    }
}
</style>

