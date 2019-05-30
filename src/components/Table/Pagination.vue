<template>
    <div :class="{'table-pagination': true, 'zeroTop':top==true}" >

        <div class="table-pagination__pages">
            <a class="table-pagination__previous" :class='{"table-pagination__previous--disabled": previousBtnDisabled}' @click.prevent='goToPreviousPage'></a>
            <a class="table-pagination__page" :class='{"table-pagination--active": activePage === firstPage}' @click.prevent='goToPage(firstPage)'>{{firstPage}}</a>
            <span class="table-pagination__page"  v-if='activePage > firstPage+2' >...</span>

            <a v-for='n in pageToShow' class="table-pagination__page" :class='{"table-pagination--active": activePage === n}' @click.prevent='goToPage(n)'>{{n}}</a>

            <span class="table-pagination__page" v-if='activePage < lastPage-2' >...</span>
            <a class="table-pagination__page" v-if='firstPage !== lastPage' :class='{"table-pagination--active": activePage === lastPage}' @click.prevent='goToPage(lastPage)'>{{lastPage}}</a>
            <a class="table-pagination__next" :class='{"table-pagination__next--disabled": nextBtnDisabled}' @click.prevent='goToNextPage'></a>
        </div>

        <span class="table-pagination__go-to">Idź do strony: </span>
        <input class="table-pagination__go-to-input" type="number" @keyup.enter='goToPage(manualPageNumber)' v-model.number='manualPageNumber'/>
    </div>
</template>

<script>
import { EventBus } from '../../main.js';

export default {
  props: ['pagination', 'config', 'top', 'itemsPerPage'],
  data: function() {
    return {
      manualPageNumber: null,
      activePage: 1,
      totalPages: null,
      totalNumberPages: 4,
      startPageIndex: 0,

      previousBtnDisabled: true,
      nextBtnDisabled: true,

      firstPage: 1,
      lastPage: 1,
      nextPage: null,
      previousPage: null,

      pageToShow: [],
    };
  },
  created: function() {
    this.createPagination();
  },
  watch: {
    pagination: function() {
      this.createPagination();
    },
    itemsPerPage() {
      EventBus.$emit('callGetDataOnCreation', this.itemsPerPage);
    },
  },
  methods: {
    goToNextPage: function() {
      if (!this.nextBtnDisabled) {
        this.$Progress.start();
        this.$http.get(this.pagination['hydra:next']).then(response => {
          this.$Progress.finish();
          EventBus.$emit('paginationAction', response.data);
        }).catch(() => {
          this.$Progress.fail();
        });
      }
    },
    goToPreviousPage: function() {
      if (!this.previousBtnDisabled) {
        this.$Progress.start();
        this.$http.get(this.pagination['hydra:previous']).then(response => {
          this.$Progress.finish();
          EventBus.$emit('paginationAction', response.data);
        }).catch(() => {
          this.$Progress.fail();
        });
      }
    },
    goToPage: function(pageNumber) {
      if (pageNumber !== this.activePage && (pageNumber >= this.firstPage && pageNumber <= this.lastPage)) {
        const url = this.pagination['@id'].slice(0, this.pagination['@id'].lastIndexOf('=')) + '=' + pageNumber;
        this.$Progress.start();
        this.$http.get(url).then(response => {
          this.$Progress.finish();
          EventBus.$emit('paginationAction', response.data);
        }).catch(() => {
          this.$Progress.fail();
        });
      }
    },

    resetState() {
      this.firstPage = 1;
      this.lastPage = 1;
      this.nextPage = null;
      this.previousPage = null;
      this.previousBtnDisabled = true;
      this.nextBtnDisabled = true;
      this.totalPages = null;
      this.activePage = 1;
      this.pageToShow = [];
    },

    createPagination() {
      this.resetState();

      if (this.pagination) {
        if (this.pagination['hydra:last'] !== undefined && this.pagination['@id'] !== undefined) {
          this.totalPages = parseInt(this.pagination['hydra:last'].slice(this.pagination['hydra:last'].lastIndexOf('=') + 1));    // 34
          this.lastPage = this.totalPages;
          this.activePage = parseInt(this.pagination['@id'].slice(this.pagination['@id'].lastIndexOf('=') + 1));
          this.firstPage = parseInt(this.pagination['hydra:first'].slice(this.pagination['hydra:first'].lastIndexOf('=') + 1));

          if (this.pagination['hydra:next']) {
            this.nextPage = parseInt(this.pagination['hydra:next'].slice(this.pagination['hydra:next'].lastIndexOf('=') + 1));
          } else {
            this.nextPage = null;
          }

          if (this.pagination['hydra:previous']) {
            this.previousPage = parseInt(this.pagination['hydra:previous'].slice(this.pagination['hydra:previous'].lastIndexOf('=') + 1));
          } else {
            this.previousPage = null;
          }

          this.nextBtnDisabled = this.nextPage === null;                                                            // THIS IS THE SAME WHAT this.nextPage===null?true:false
          this.previousBtnDisabled = this.previousPage === null;                                                    // THIS IS THE SAME WHAT this.previousPage===null?true:false
        }
      }

      if (this.activePage <= this.firstPage + 2) {
        if (this.totalPages >= this.totalNumberPages) {
          this.pageToShow.push(this.firstPage + 1);
          this.pageToShow.push(this.firstPage + 2);
          this.pageToShow.push(this.firstPage + 3);
        } else if (this.totalPages === 3) {
          this.pageToShow.push(this.firstPage + 1);
        }
      } else if (this.activePage >= this.lastPage - 2) {
        if (this.totalPages >= this.totalNumberPages) {
          this.pageToShow.push(this.lastPage - 3);
          this.pageToShow.push(this.lastPage - 2);
          this.pageToShow.push(this.lastPage - 1);
        }
      } else {
        if (this.totalPages >= this.totalNumberPages) {
          this.pageToShow.push(this.activePage - 1);
          this.pageToShow.push(this.activePage);
          this.pageToShow.push(this.activePage + 1);
        }
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../css/variables';
.zeroTop{
    margin-top:0 !important;
}
.table-pagination {
    display:flex;
    align-items:center;
    justify-content: center;
    font-family: 'Quicksand medium';
    color:  #9f9f9f;
    font-size:14px;
    margin-top: 40px;
    &__show-label, &__go-to {
        margin-right:10px;
    }
    &__show-select>select{
        color: $grid-toolbar-select--txt-col;
        border:1px solid $grid-toolbar-select-border;
        font-family: 'Quicksand';
        border-radius:5px;
        padding-left: 10px;
        padding-right: 25px;
        padding-top: 3px;
        padding-bottom: 3px;
        background-image:url('../../static/images/icons/actions-general/arrow-down-black.png');
        background-position: 95% center;
        background-repeat: no-repeat;

        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

        &::-ms-expand {
            display: none;
        }
        &:active {
            outline:none;
        }
        &:focus{
            outline:none;
        }
    }

    &__pages {
        display: flex;
        align-items: center;
        margin: 0 30px;
    }
    &__previous, &__next {
        cursor: pointer;
        padding: 10px;
        background-color:white;
        display:flex;
        justify-content: center;
        align-items:center;
        height: 35px;
        width: 40px;
        margin: 0 10px;
        box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.15);
        border-radius:5px;
        &--disabled {
            cursor: not-allowed;
            background-color: gainsboro
        }
    }
    &__previous {
        background-image:url('../../static/images/icons/actions-general/arrow-left.png');
        background-position:center;
        background-repeat: no-repeat;
    }
    &__next {
        background-image:url('../../static/images/icons/actions-general/arrow-right.png');
        background-position:center;
        background-repeat: no-repeat;
    }
    &__page {
        cursor:pointer;
        padding: 5px 15px;
        margin:0 10px;
        box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.15);
        background-color:white;
        display:flex;
        justify-content: center;
        align-items:center;
        border-radius:5px;
        color:  #b3b3b3;
        font-size:16px;
    }
    &__go-to-input {
        max-width:40px;
        text-align:center;
        outline:none;
        font-family: 'Quicksand';
        color:  #9f9f9f;
        border-radius:5px;
        border:1px solid #d8d8d8;
        padding-top: 3px;
        padding-bottom: 3px;
        &:focus {
            outline:none;
        }
        &:active {
            outline:none;
        }
    }
    &--active {
        background-color:$action-color;
        color:white !important;
    }
}
</style>
