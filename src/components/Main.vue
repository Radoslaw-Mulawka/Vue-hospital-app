<template>
    <div>
        <div class='container-fluid'>
            <div class="row justify-content-center navigation-row">
                <div class="col-12 col-xl-10">
                    <Navigation :changeDepartment='changeDepartment'></Navigation>
                </div>
            </div>
            <div class="row justify-content-center main-content-row">
                <div class="col-12 bg-box"></div>
                <Content :department='department' :freshPlans='freshPlans'></Content>
            </div>
        </div>
    </div>
</template>

<script>
import Navigation from './Navigation.vue';
import Content from './Content.vue';
export default {
  data: function() {
    return {
      department: null,
      freshPlans: [],
    };
  },
  created() {
    setInterval(() => {
      this.$http.get(`/api/app/nourished_plans?companyDepartment.uuid=${this.department}&context=nourishedPlanGrid`).then(response => {
        this.freshPlans = response.data['hydra:member'];
      }).catch(error => {
        console.error(error);
      });
    }, 60000);
  },
  components: {
    Navigation,
    Content,
  },
  methods: {
    changeDepartment(newDepartment) {
      this.department = newDepartment;
    },
  },
};
</script>

<style lang="scss">
@import '../css/variables';
.navigation-row{
    background-color: #403a8f;
}
.main-content-row {
    position: relative;
    padding-bottom: 30px;
}
@media only screen and (min-width: 600px){
    .v-snack__wrapper {
        width: auto;
        max-width: 568px;
        min-width: 488px;
        margin: 0 auto;
        border-radius: 2px;
    }
}
.v-snack--multi-line .v-snack__content {
    height:auto;
}
</style>
