<template>
  <transition name="fade">
    <div
      v-if="alertsArray.length>0"
      class="alert-messages-container"
    >
      <transition-group
        name="fade"
        tag="div"
      >
        <div :class="['alert-' + alert.status]" class="alert p-0 shadow" :key='alert.id' v-for='(alert) of alertsArray'> <!-- alert--flash fade show  role="alert" -->
          <div class="media p-3">
            <div class="media-body row align-items-center" style='min-width: 350px; max-width: 800px; font-size: 1.2em;'>
              <div class="col-2">
                <i v-if="alert.status === 'info'" class="small fe fe-info"></i>
                <i v-if="alert.status === 'danger'" class="small fe fe-alert-circle"></i>
                <i v-if="alert.status === 'warning'" class="small fe fe-alert-triangle"></i>
                <i v-if="alert.status === 'success'" class="small fe fe-check"></i>
              </div>
              <div class="col-8" style='display:flex; align-items:center'>
                <span class="small" v-html="alert.message"></span>
              </div>
              <div class="col-2">
                <button type="button" class="close" style="position:relative" @click="dismissAlert(alert.id)"> <!-- aria-label="Close" -->
                    <span aria-hidden="true"><i class="small fe fe-x-circle"></i></span>
                </button>
              </div>
            </div><!-- /media-body row -->
          </div><!-- /media -->
        </div><!-- /alert container -->
      </transition-group>
    </div>
    </transition>
</template>

<script>
import { EventBus } from '../main.js';
import { setTimeout } from 'timers';

export default {
  data() {
    return {
      alertsArray: [],
    };
  },
  created() {
    EventBus.$on('triggerAlert', ({ message, triggerManualError, type }) => {
      let errorMessages = ``;
      const objectToAdd = {
        status: null,
        message: null,
        id: Symbol(),
        type: type,
      };

      if (message.violations && message.violations.length > 0) {
        if (message.violations.length === 1) {
          errorMessages = `${message.violations[0].message}`;
        } else {
          for (const [index, violation] of Object.entries(message.violations)) {
            if (index === message.violations.length - 1) {
              errorMessages += `- ${violation.message}`;
            } else {
              errorMessages += `-${violation.message}</br></br>`;
            }
          }
        }
        objectToAdd.status = 'danger';
      } else if (message['hydra:description']) {
        errorMessages = message['hydra:description'];
        objectToAdd.status = 'danger';
      } else if (triggerManualError === true) {
        errorMessages = message;
        objectToAdd.status = 'danger';
      } else {
        errorMessages = message;
        objectToAdd.status = 'success';
      }

      objectToAdd.message = errorMessages;

      if (type) {
        const alertsWithTypes = this.alertsArray.filter(alert => {
          return alert.type === type;
        });

        if (alertsWithTypes.length >= 1) {
          for (let i = 0; i <= this.alertsArray.length; i++) {
            if (this.alertsArray[i].type === type) {
              this.alertsArray.splice(i, 1, objectToAdd);
              break;
            }
          }
        } else {
          this.alertsArray.push(objectToAdd);
        }
      } else {
        this.alertsArray.push(objectToAdd);
      }

      if (this.alertsArray.find(alert => alert.id === objectToAdd.id)) {
        setTimeout(() => {
          this.alertsArray = this.alertsArray.filter(alert => {
            return alert.id !== objectToAdd.id;
          });
        }, 8000);
      }
    });
  },
  methods: {
    dismissAlert: function(id) {
      this.alertsArray = this.alertsArray.filter(alert => {
        return alert.id !== id;
      });
    },
  },
};
</script>

<style lang="scss">
@import "../css/variables";

$danger: #f8d7da;
// ---------------------------
// --- project: IMFood
// --- description: flash alerts styles
// --- author: DSB SI-Consulting.pl
// --- version: 0.1
// --- module: _flash-alerts.scss
// ---------------------------

// attr class for validated inputs
.is-invalid {
  border-color: $danger !important;
  box-shadow: 0 0 8px rgba($danger, 0.4);
}

.alert-messages-container {
  position: fixed;
  bottom: 15px;
  right: 15px;
  z-index: 1;
}

.alert {
  // fixed flash message
  // based on default bootstrap color map
  // (danger, warning, info, success, primary, secondary, etc.)
  // usage .alert .alert--flash
  &--flash {
    // position: fixed;
    // bottom: 15px;
    // right: 15px;
    min-width: 400px;
    // -webkit-transform: translate(-50%, -50%);
    //     -ms-transform: translate(-50%, -50%);
    //         transform: translate(-50%, -50%);
    z-index: 10;
  }

  &--flash,
            // grouped for list messages in form
        &--grouped {
    border-left-width: 10px;
  }

  // cloud alert positioned to input
  &--cloud {
    border-left-width: 5px;
    margin-top: 2px;
    grid-column: 2;
    position: relative;
    // mapping class names for triangle color
    &.alert-danger {
      --cc: #f5c6cb;
    }

    &.alert-warning {
      --cc: #ffeeba;
    }

    &.alert-info {
      --cc: #bee5eb;
    }

    &.alert-success {
      --cc: #c3e6cb;
    }

    &:after,
    &:before {
      bottom: 100%;
      left: 10px;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
    }

    &:after {
      border-color: rgba(136, 183, 213, 0);
      border-bottom-color: var(--cc);
      border-width: 5px;
      margin-left: -5px;
    }

    &:before {
      border-color: rgba(194, 225, 245, 0);
      border-bottom-color: var(--cc);
      border-width: 6px;
      margin-left: -6px;
    }

    // @media screen and (min-width: 1400px) {
    //     min-width: 350px;
    //     max-width: 350px;
    //     width:350px;
    //     right:calc(-100% - 10px);
    //     //chrome hack
    //     @media screen and (-webkit-min-device-pixel-ratio:0) {
    //         right:-73%;
    //     }
    //     position: relative;
    //     top:-32px;
    //     margin-bottom: -32px;
    //     z-index: 2;
    //     &:after,
    //     &:before {
    //         right: 100%;
    //         top: 50%;
    //         left: -10px;
    //         bottom: 0;
    //         border: solid transparent;
    //         content: " ";
    //         height: 0;
    //         width: 0;
    //         position: absolute;
    //         pointer-events: none;
    //     }
    //     &:after {
    //         border-color: rgba(136, 183, 213, 0);
    //         border-right-color: var(--cc);
    //         border-width: 5px;
    //         margin-top: -5px;
    //     }
    //     &:before {
    //         border-color: rgba(194, 225, 245, 0);
    //         border-right-color: var(--cc);
    //         border-width: 6px;
    //         margin-top: -6px;
    //     }
    // }
    // .close--alert {
    //     font-size: 1rem;
    // }
  }

  &--cloud--bottom {
    width: 100%;
    border-left-width: 5px;
    margin-top: 2px;
    position: absolute;
    // mapping class names for triangle color
    &.alert-danger {
      --cc: #f5c6cb;
    }

    &.alert-warning {
      --cc: #ffeeba;
    }

    &.alert-info {
      --cc: #bee5eb;
    }

    &.alert-success {
      --cc: #c3e6cb;
    }

    &:after,
    &:before {
      bottom: 100%;
      left: 10px;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
    }

    &:after {
      border-color: rgba(136, 183, 213, 0);
      border-bottom-color: var(--cc);
      border-width: 5px;
      margin-left: -5px;
    }

    &:before {
      border-color: rgba(194, 225, 245, 0);
      border-bottom-color: var(--cc);
      border-width: 6px;
      margin-left: -6px;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */
 {
  opacity: 0;
}

// eof -----------------------
</style>
