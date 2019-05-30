<template>
    <td  :colspan='Object.keys(config.columns).length'><div class='loader'></div></td>
</template>

<script>
export default {
  props: ['config'],
};
</script>

