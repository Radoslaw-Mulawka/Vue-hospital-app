<template>
    <div class="content">
        <vue-progress-bar></vue-progress-bar>
        <img class="content__logo" src="../static/images/login-logo.png" alt="ImFood Logo">
        <div class="content__login login">
            <div class="login__left-block"></div>
            <div class="login__right-block right-block">
                <p class="right-block__header">Odzyskiwanie hasła</p>

                <form v-if='$route.path.includes("recovery-step-1")' class="right-block__form  form--columned form">
                    <input v-model='email' type="email" id="recovery_step1_email"  required="required" placeholder="Adres e-mail" maxlength="255" class="form__input form__input"/>
                    
                    <label v-if='error.status' class="form__error" :style='{color: error.color}' v-html='error.message'></label>
                    <div>
                        <button @click.prevent='sendMail' id="recovery_step1_Odzyskaj hasło" class="form__button">Odzyskaj hasło</button>
                    </div>
                </form>
                <form v-else class="right-block__form  form--columned form">
                    <input v-model='newPassword1' type="password"  required="required" placeholder="Nowe hasło" maxlength="255" class="form__input form__input"/>
                    <input v-model='newPassword2' type="password"   required="required" placeholder="Nowe hasło" maxlength="255" class="form__input form__input"/>
                    
                    <label v-if='error.status' class="form__error" :style='{color: error.color}' v-html='error.message'></label>
                    <div>
                        <button @click.prevent='sendNewPassword' id="recovery_step1_Odzyskaj hasło" class="form__button">Zmień hasło</button>
                    </div>
                </form>

                <router-link class="form__link" to='/login' exact>Powrót do logowania</router-link>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data: ()=>{
        return {
            email: null,
            error: {
                status: false,
                message: '',
                color:'#dc3545'
            },
            newPassword1: '',
            newPassword2: ''
        }
    },
    methods:{
        sendMail(){
            if(this.validateEmail()){
                this.$Progress.start();
                this.$http.get(`/api/app/recovery_password?email=${this.email}`).then(response=>{
                    this.$Progress.finish();
                    this.error.status = true;
                    this.error.color = '#339648';
                    this.error.message = response.data.message;
                }).catch(error=>{
                    this.$Progress.fail();
                    this.error.status = true;
                    this.error.color = '#dc3545';
                    
                    this.error.message = ``;
                    if(error.response.data.violations){
                        for(let violation of error.response.data.violations){
                            this.error.message += violation.message + `<br/>`;
                        }
                    }
                    else if(error.response.data.violations == undefined && error.response.data['hydra:description']){
                        this.error.message += error.response.data['hydra:description'] + `<br/>`;
                    }
                    else {
                        this.error.message += error.response.data.details;
                    }
                })
            }
            else{
                this.error.status = true;
                this.error.color = '#dc3545';
                this.error.message = 'Wpisz właściwy adres email';
            }
        },
        sendNewPassword(){
            if( (this.newPassword1 && this.newPassword2) && (this.newPassword1 === this.newPassword2) ){
                this.$Progress.start();
                this.$http.put(`/api/app/recovery_password/step2/${this.$route.params.user_uuid}/token/${this.$route.params.user_token}?context=user`, {"plainPassword":this.newPassword1})
                .then(response=>{
                    this.error.status = true;

                    this.$Progress.finish();
                    this.error.message = response.data.message;
                    this.error.color = '#339648';
                })
                .catch(error=>{
                    this.$Progress.fail();
                    this.error.status = true;
                    this.error.color = '#dc3545';

                    this.error.message = ``;
                    if(error.response.data.violations){
                        for(let violation of error.response.data.violations){
                            this.error.message += violation.message + `<br/>`;
                        }
                    }
                    else if(error.response.data.violations == undefined && error.response.data['hydra:description']){
                        this.error.message += error.response.data['hydra:description'] + `<br/>`;
                    }
                    else {
                        this.error.message += error.response.data.details;
                    }
                })
            }
            else {
                this.error.status = true;
                this.error.color = '#dc3545';
                this.error.message = 'Sprawdź poprawność wpisanych haseł';
            }
        },
        validateEmail() {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(this.email).toLowerCase());
        }
    },
    watch: {
        email(){
            this.error.status = false;
            this.error.message = '';
            this.error.color = '#dc3545'
        },
        newPassword1(){
            this.error.status = false;
            this.error.message = '';
            this.error.color = '#dc3545'
        },
        newPassword2(){
            this.error.status = false;
            this.error.message = '';
            this.error.color = '#dc3545'
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../css/variables';
@font-face {
    font-family: 'Quicksand medium';
    src: url('../static/fonts/Quicksand-Medium.ttf');
}

@font-face {
    font-family: 'Quicksand';
    src: url('../static/fonts/Quicksand-Regular.ttf');
}

html {
    box-sizing: border-box;
}

*,
*:before,
*:after {
    box-sizing: inherit;
}

body {
    height: 100vh;
    margin: 0;
    padding: 0;
    font-family: 'Quicksand';
    background-color: #f1f2f5;
}

a {
    text-decoration: none !important;
    color: inherit;
}

.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    &__logo {
        max-width: 100%;
        height: auto;
        margin-bottom: 30px;
    }
    &__login {
        width: 865px;
        min-height: 568px;
        @media screen and (max-width: 900px) {
            & {
                width:500px;
            }
        }
    }
}

.login {
    display: flex;
    color: $login-main-txt;
    &__left-block {
        flex: 1;
        background-color: $nav-bg-color;
        background-image: url('../static/images/rocket.png');
        background-repeat: no-repeat;
        background-position: center;
        @media screen and (max-width: 900px) {
            & {
                display:none;
            }
        }
    }
    &__right-block {
        flex: 1;
    }
}

.right-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 80px;
    background-color: #201f39;
    &__header{
        margin: 0;
        font-size: 30px;
        font-family: 'Quicksand medium';
        margin-bottom: 55px;
        width: 100%;
        text-align: center;
    }
    &__form {
        width: 100%;
    }
}

.form {
    display: flex;
    align-items: center;
    justify-content: center;
    &__input-group {
        width: 100%;
        text-align: center;
        & div {
            display:flex;
            flex-direction:column;
            align-items:center;
        }
        label {
            text-align: justify;
            padding-left:5px;
        }
    }
    &__input {
        background-color: transparent;
        border: none;
        border-bottom: 2px solid #676582;
        width: 75%;
        font-family: 'Quicksand';
        color: $login-main-txt;
        font-size: 14px;
        padding: 7px 0px;
        padding-left: 5px;
        margin-bottom: 33px;
        outline: none;
        border-radius:0 !important;
        &::placeholder {
            color: $login-main-txt;
        }
    }

    &__input:-webkit-autofill {
        -webkit-box-shadow: inset 0 0 0px 9999px #201f39;
        -webkit-text-fill-color: $login-main-txt !important;
        caret-color: $login-main-txt;
    }
    &__input:focus,
    &__input:-webkit-autofill:focus {
        -webkit-box-shadow: inset 0 0 0px 9999px #201f39;
        -webkit-text-fill-color: $login-main-txt !important;
    }
    &__error {
        width: 75%;
        margin-bottom: 33px;
        font-size: 14px;
    }
    &__remember-password {
        align-self: flex-start;
        margin-left: 50px;
        margin-bottom: 40px;
        @media screen and (max-width: 900px) {
            & {
                margin-left: 58px;
            }
        }
    }
    &__button {
        font-size: 16px;
        color: $login-second-main-txt;
        background-color: #fd7555;
        padding: 15px 50px;
        border-radius: 5px;
        border: none;
        outline: none;
        cursor: pointer;
        margin-bottom: 45px;
        box-shadow: 0px 5px #f34a22;
        &:active {
            box-shadow: 0px 3px #f34a22;
            transform: translateY(4px);
        }
    }
    &__link {
        color: #00baff;
        margin-bottom: 80px;
    }
}

.remember-password {
    display: flex;
    align-items: center;
    &__check {
        width: 22px;
        height: 22px;
        cursor: pointer;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        outline: 0;
        background: #676582;
        margin-right: 20px;
        &::after {
            content: '';
            position: relative;
            left: 40%;
            top: 20%;
            width: 15%;
            height: 40%;
            border: solid $white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            display: none;
        }
        &:checked:after {
            display: block;
        }
        &:disabled:after {
            border-color: #7b7b7b;
        }
    }
    &__label {
        font-size: 14px;
        color: $login-main-txt;
        cursor: pointer;
    }
}

.form--columned {
    flex-direction: column;
}
</style>
