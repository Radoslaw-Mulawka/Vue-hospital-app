<template>
  <td>
      <div style="float:left; display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <input
          type="number"
          min="0"
          v-model.number='ownQuantity'
          @keyup.enter="sendChangedData"
          @blur="sendChangedData"
          class="w-100 form__input"
          v-bind:class="{ 'form__input--loader' : isSending }"
        >
      </div>
  </td>
</template>

<script>
import { EventBus } from '../main';

export default {
  props: [
    'peopleNumber', 
    'uuid', 
    'correct', 
    'mealId',
    "computedPositions",
    "diet",
    "correction",
    "correctionValue"
  ],
  data() {
    return {
      isClicked: false,
      ownQuantity: 0,
      isSending: false,
    };
  },
  created() {
    this.ownQuantity = [this.releaseQuantity, this.peopleNumber, this.correctionValue].find(item=>item !== undefined);
  },
  methods: {
    sendChangedData(event) {
      let comparedValues;

      if(this.correction == false){
        comparedValues = this.peopleNumber !== undefined && this.peopleNumber !== this.ownQuantity;
      }
      else{
        comparedValues = this.correctionValue !== undefined && this.correctionValue !== this.ownQuantity;
      }

      if (comparedValues) {
        if( this.ownQuantity == null || this.ownQuantity == undefined || typeof this.ownQuantity== "string" ){
          EventBus.$emit('triggerAlert', {message: 'Podana wartość jest błędna', triggerManualError: true, type:'inputError'});  // Aktualizowana wartość nie może być pusta
          this.ownQuantity =[this.releaseQuantity, this.peopleNumber, this.correctionValue].find(item=>item !== undefined);
          return false;
        }


        this.$Progress.start();
        this.isSending = true;
        let dataForSending = this.correction ? {correction: parseInt(this.ownQuantity)} : {peopleNumber: parseInt(this.ownQuantity)};
        let posId= this.computedPositions[this.diet.uuid].nourishedPlanPositions[this.uuid].uuid;
        let url = `/api/app/nourished_plan_positions/${posId}?context=nourishedPlanPosition` ;
                    
        EventBus.$emit('startUpdating', 'start');
        this.$http.put(url, dataForSending).then(data => {
          EventBus.$emit('triggerAlert', { message: 'Pozycja została zaktualizowana poprawnie.', type: 'updatePlanPosition' });
          EventBus.$emit('startUpdating', 'stop');
          EventBus.$emit('newPositionValue', {response: data, diet: this.diet, uuid: this.uuid});

          this.$Progress.finish();
          this.isSending = false;

          this.ownQuantity = [this.releaseQuantity, this.peopleNumber, this.correctionValue].find(item=>item !== undefined);
        }).catch(error => {
          EventBus.$emit('startUpdating', 'stop');
          this.$Progress.fail();
          this.isSending = false;
          console.error('Error:', error);
        });
      }
    },
  },
  watch:{
    peopleNumber(){
      this.ownQuantity = [this.releaseQuantity, this.peopleNumber, this.correctionValue].find(item=>item !== undefined);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../css/variables';
td{
  // background-color: #eeeeee;
  border:none !important;
}
input {
  // cursor: pointer;
  width: 100%;
  color: $tbody-txt-col;
  border: 1px solid #c4c0d8;
  padding: 2px 5px;
  border-radius: 3px;
  outline: none;
  background-color:white;
  &:hover {
    border:1px solid black;
  }
}
// input[type=number]::-webkit-inner-spin-button,
// input[type=number]::-webkit-outer-spin-button {
//   -webkit-appearance: none;
//   margin: 0;
// }
</style>
