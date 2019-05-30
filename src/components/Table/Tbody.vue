<template>
    <tbody>

        <Trow v-if='oneObject.isLoading === undefined && oneObject.lackOfData === undefined'
              v-for='(oneObject, index) in finalTableData'
              :key='index'
              :oneObject='oneObject'
              :index='index'
              :config='config'
              :originalData='originalData'
              >
        </Trow>
        <tr v-else>
            <LoadingCell v-if="finalTableData[0].isLoading" :config='config'></LoadingCell>
            <EmptyCell v-if='finalTableData[0].lackOfData' :config='config'></EmptyCell>
        </tr>
    </tbody>
</template>

<script>
import Trow from './Trow.vue';
import LoadingCell from './LoadingCell.vue';
import EmptyCell from './EmptyCell.vue';
export default {
  props: ['finalTableData', 'config', 'originalData'],
  components: {
    Trow,
    LoadingCell,
    EmptyCell,
  },
};
</script>

