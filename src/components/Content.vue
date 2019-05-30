<template>
    <div class="col-12 col-xl-10 content" :class='{"noBreadCrumbs" : !$route.path.includes("menus")}' style='padding-top:0'> <!-- col-md-11 col-xl-10  -->
                <div v-if='$route.path.includes("menus")'  class="basic-info">
                    <div class="basic-info__actions">
                        <div class="basic-info__name">
                            Podgląd jadłospisu
                            <div style='margin-left:10px; display: flex; align-items: center;'>
                                dla diety:
                                <span
                                    v-if='dietShortcut && dietColor' 
                                    :style='{"font-size":"1rem",
                                            "margin-left":"10px",
                                            "display": "flex",
                                            "align-items": "center",
                                            "padding":"0px 15px",
                                            "background-color" : dietColor,
                                            "color": getContrastYIQ(dietColor),
                                            "border-radius":"3px"}'>
                                    {{dietShortcut}}
                                </span>
                                <span v-else :style='{
                                            "margin-left":"10px",
                                            "display": "flex",
                                            "align-items": "center",
                                            "border-radius":"3px"}'>
                                  {{dietShortcut}}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content__columns">
                    <div class="container-fluid">
                        <div class="row">
                            <router-view :department='department' :freshPlans='freshPlans'></router-view>  <!-- Main.js main router-view   -->
                        </div>
                    </div>
                </div>
            </div>
</template>

<script>
import { EventBus } from '../main';
export default {
  props: ['department', 'freshPlans'],
  data() {
    return {
      route: '',
      dietShortcut: null,
      dietColor: null,
    };
  },
  // filters: {
  //   filterPath(value) {
  //     let firstPathPart = value.split('/');
  //     if (firstPathPart.includes('diets')) {
  //       firstPathPart = 'diets';
  //     } else if (firstPathPart.includes('plans')) {
  //       firstPathPart = 'plans';
  //     } else if (firstPathPart.includes('menus')) {
  //       firstPathPart = 'menus';
  //     } else {
  //       firstPathPart = '/';
  //     }

  //     switch (firstPathPart) {
  //       case '/': return 'Kalendarz';
  //       case 'diets': return 'Aktywne diety i jadłospisy';
  //       case 'plans': return 'Plany żywionych';
  //       case 'menus': return 'Podgląd jadłospisu';
  //     }
  //   },
  // },
  created() {
    const routes = this.$router.history.current.fullPath.split('/');
    for (const [value, index] of routes.entries()) {
      if (value === '') {
        routes.splice(index, 1);
      }
    }
    this.route = routes;

    EventBus.$on('menuData', ({ shortcut, color }) => {
      this.dietShortcut = shortcut;
      this.dietColor = color;
    });
  },
  methods: {
    checkPath(value) {
      const firstPathPart = value.split('/');
      if (firstPathPart.includes('menus')) {
        return true;
      }
    },
    getContrastYIQ(hexcolor) {
      var r = parseInt(hexcolor.substr(1, 3), 16);
      var g = parseInt(hexcolor.substr(3, 4), 16);
      var b = parseInt(hexcolor.substr(5, 3), 16);
      var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return (yiq >= 128) ? 'black' : 'white';
    },
  },
  watch: {
    '$route'(to, from) {
      const routes = this.$router.history.current.fullPath.split('/');
      for (const [value, index] of routes.entries()) {
        if (value === '') {
          routes.splice(index, 1);
        }
      }
      this.route = routes;
      this.dietShortcut = null;
      this.dietColor = null;
    },
  },
};
</script>

<style lang="scss">
@import '../css/variables';
.noBreadCrumbs{
  margin-top:40px;
}
</style>
