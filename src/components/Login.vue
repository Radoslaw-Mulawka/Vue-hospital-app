<template>
    <div class="content">
        <vue-progress-bar></vue-progress-bar>
        <img class="content__logo" src="../static/images/login-logo.png" alt="ImFood Logo">
        <div class="content__login login">
            <div class="login__left-block"></div>
            <div class="login__right-block right-block">
                <p class="right-block__header">Logowanie</p>
                <form class="right-block__form form form--columned">
                    <input class="form__input" type="text" id="username" name="_username" required="required"
                        placeholder="E-mail" v-model='login'>
                    <input class="form__input" type="password" id="password" name="_password" required="required"
                        placeholder="Hasło" v-model='password'>

                     <label v-if='app_access_error' class="form__error">Nie masz dostępu do aplikacji</label>
                     <label v-if='access_error' class="form__error">Wpisałeś błędne hasło lub email</label>
<!--
                    <label class="form__error alert alert">

                    </label> -->

                    <div class="form__remember-password remember-password">
                        <input class="remember-password__check" type="checkbox" id="remember_me" name="_remember_me">
                        <label class="remember-password__label">Zapamiętaj hasło</label>
                    </div>
                    <button class="form__button" @click.prevent='logIn'>Zaloguj</button>
                    <router-link to='/login/recovery-step-1' exact class='form__link'> Odzyskaj hasło </router-link>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import jwtDecode from 'jwt-decode';
export default {
  data: function() {
    return {
      login: '',
      password: '',
      app_access_error: false,
      access_error: false,
    };
  },
  methods: {
    logIn() {
      if (this.login.trim() !== '' && this.password.trim() !== '') {
        this.app_access_error = false;
        this.access_error = false;

        this.$Progress.start();
        this.$http.post('/api/login_check', {
          'username': this.login,
          'password': this.password,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(response => {
          this.$Progress.finish();
          const token = response.data.token;
          const decoded = token !== null ? jwtDecode(token) : null;
          if (decoded.roles.includes('ROLE_AS_ACCESS')) {
            localStorage.setItem('token', response.data.token);
            this.$router.push('/');
          } else {
            // this.$router.push('/login');
            this.app_access_error = true;
          }
        }).catch(error => {
          this.$Progress.fail();
          if (error.response.data.message === 'Bad credentials') {
            this.access_error = true;
          }
        });
      }
    },
  },
  watch: {
    login() {
      this.access_error = false;
      this.app_access_error = false;
    },
    password() {
      this.access_error = false;
      this.app_access_error = false;
    },
  },
};
</script>

<style lang="scss" scoped>
    @import '../css/variables';

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        // height: 100vh;

        &__logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 30px;
            @media screen and (max-width: 900px) {
                & {
                    width:100px;
                }
            }
        }

        &__login {
            width: 70%;
            min-width: 850px;
            max-width:900px;
            min-height: 568px;

            @media screen and (min-width: 450px) and (max-width:900px){
                & {
                    width:60%;
                    min-width: 450px;
                }
            }
            @media screen and (max-width: 450px) {
                & {
                    width:100%;
                    min-height: 480px;
                    min-width: unset;
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
            background-image: url('../static/images/food.png');
            background-repeat: no-repeat;
            background-position: center;

            @media screen and (max-width: 900px) {
                & {
                    display: none;
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
        @media screen and (max-width: 900px) {
            & {
                padding-top: 50px;
            }
        }
        &__header {
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
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            label {
                text-align: justify;
                padding-left: 5px;
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
            border-radius:0;
            &::placeholder {
                color: $login-main-txt;
            }
            @media screen and (max-width: 450px) {
                & {
                    width:85%;
                }
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
            margin-bottom: 40px;
            width:75%;
            @media screen and (max-width: 700px) {
                & {
                    // margin-left: 58px;
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
            @media screen and(max-width:900px){
                margin-bottom: 40px;
            }
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
