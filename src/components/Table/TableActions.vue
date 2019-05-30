<template>
    <td class='action-border-none'>
        <div class="dropdown">
            <a style="position:relative;" role="button" :id='oneObject.uuid.value' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <div class="content__action-dots">
                    <span class='action-dot'></span>
                    <span class='action-dot'></span>
                    <span class='action-dot'></span>
                </div>
            </a>
            <div class="dropdown-menu dropdown-small-width dropdown-menu-right dropdown-menu--triangle" :aria-labelledby='oneObject.uuid.value'>
                <template v-for="(action,index) in actions">
                    <router-link
                        v-if="action.type !=='file' &&  (!action.fun || (action.fun && (action.fun(objectComparison(oneObject)) == true ? true : checkFunction())) )"
                        :key='index'
                        :to='changeActionUrl(action.url, oneObject)'
                        class="dropdown-item"
                        :class="{'nowrap-action': action.type=='show', ['hidden-actions__'+action.type] : true}"
                        exact
                    >
                        {{action.text}}
                    </router-link>
                    <a v-else
                        :key='index'
                        @click.prevent='generatePdf(changeActionUrl(action.url, oneObject))'
                        class="dropdown-item"
                        :class="{'nowrap-action': action.type==='show', ['hidden-actions__'+action.type] : true}"
                    >
                        {{action.text}}
                    </a>
                </template>
            </div>
        </div>
    </td>
</template>

<script>
export default {
  props: [
    'config',
    'oneObject',
    'type',
    'is_granted_menu_edit',
    'is_granted_menu_show',
    'is_granted_menu_pdf',
    'originalData'],
  data: function() {
    return {
      isShown: false,
    };
  },
  computed: {
    showOrNot: function() {
      return this.isShown === true ? 'block' : 'none';
    },
    actions() {
      const actions = [];
      for (const value of this.config.actions) {
        if (this.type === 'dependent-table') {
          if (value.type === 'show' && this.is_granted_menu_show === '1') {
            actions.push(value);
          }
          if (value.type === 'file' && this.is_granted_menu_pdf === '1') {
            actions.push(value);
          } else if (value.type === 'edit' && this.is_granted_menu_edit === '1') {
            actions.push(value);
          } else if (value.type === 'clone' && this.is_granted_menu_edit === '1') {
            actions.push(value);
          }
        } else {
          actions.push(value);
        }
      }
      return actions;
    },
  },
  methods: {
    closeActionsWindow: function() {
      this.isShown = false;
    },
    changeActionUrl: function(url, oneObject) {
      let newUrl = '';
      newUrl = url;

      for (const key in oneObject) {
        const urlForReplacement = oneObject.activeMenu && oneObject.activeMenu.value
          ? oneObject.activeMenu.value['@id'].slice(oneObject.activeMenu.value['@id'].lastIndexOf('/') + 1, oneObject.activeMenu.value['@id'].length)
          : oneObject[key].value;

        newUrl = newUrl.replace('{' + key + '}', urlForReplacement);
      }
      newUrl = newUrl.replace('{diet.uuid}', oneObject.uuid.value);

      return newUrl;
    },
    generatePdf(actionButtonUrl) {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      this.$Progress.start();

      this.$http.get(actionButtonUrl + '?context=menu', {
        responseType: 'blob',
        // headers: {
        //     'Access-Control-Allow-Origin': '*'
        // }
      })
        .then(blob => {
          this.$Progress.finish();
          blob = new Blob([blob.data], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = year.toString() + month.toString() + day.toString() + hours.toString() + minutes.toString() + seconds.toString();

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    },
    objectComparison(modifiedObject) {
      return this.originalData.find(originalObject => {
        return originalObject.uuid === modifiedObject.uuid.value;
      });
    },
    checkFunction() {
      return false;
    },
  },
};
</script>

<style lang="scss">
@import '../../css/variables';
.nowrap-action {
    white-space: nowrap;
}
.action-border-none{
    text-align: center !important;
}
.content {
    &__table-actions {
        position: relative;
    }
    &__action-dots {
        width: 28px;
        display: flex;
        justify-content: space-between;
        cursor: pointer;
        position: relative;
        &:hover .action-dot {
            background-color: $action-color;
        }
    }
    &__hidden-actions {
        display: none;
        position: absolute;
        border: 1px solid #ebebeb;
        background-color: white;
        border-radius:5px;
        padding: 10px;
        z-index: 1;
        left: -105px;
        top: 32px;
        width: 150px;
        font-size: 14px;
        box-shadow: 0px 4px 9px -2px rgba(0, 0, 0, 0.59);
        .triangle {
            position: absolute;
            width: 20px;
            height: 20px;
            background-color: #ffffff;
            border-top: 1px solid #ebebeb;
            border-left: 1px solid #ebebeb;
            top: -12px;
            transform: rotate(45deg);
            right: 20px;
        }
    }
}
.hidden-actions {
    &__option {
        display: block;
        border-bottom: 1px solid #e6e6e6;
        // padding-left: 30px;
        margin: 0 5px 10px;
        padding-bottom: 10px;

        &:last-child {
            border: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
    }

    &__show,
    &__edit,
    &__clone,
    &__change-status,
    &__delete,
    &__client,
    &__assign-group,
    &__assign-kitchen,
    &__assign-diet,
    &__contract,
    &__file,
    &__department {
        &:before {
            font-family: 'feather' !important;
            margin-right: 10px;
        }
    }

    &__show:before { content: "\e97a"; }
    &__edit:before { content: "\e957"; }
    &__clone:before { content: "\e943"; }
    &__change-status:before { content: "\e966"; }
    &__delete:before { content: "\e9e2"; }
    &__client:before { content: "\e9ef"; }
    &__assign-group:before { content: "\e981"; }
    &__assign-kitchen:before { content: "\e9a0"; }
    &__assign-diet:before { content: "\e922"; }
    &__contract:before { content: "\e9ca"; }
    &__file:before { content: "\e963"; }
    &__department:before { content: "\e96a"; }

}
.action-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 30px;
    background-color: darken($light-txt-col,25%);
    cursor: pointer;
}
</style>
