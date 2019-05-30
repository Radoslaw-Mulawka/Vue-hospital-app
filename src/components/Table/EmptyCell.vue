<template>
    <td  :colspan='Object.keys(config.columns).length' style="text-align:center"><span>Brak danych</span></td>
</template>

<script>
export default {
  props: ['config'],
};
</script>

