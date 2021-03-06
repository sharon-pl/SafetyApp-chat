import React, { Component } from 'react';
import {
  StyleSheet,
  ImageBackground,
  Image,
  } from 'react-native';
import { Images } from '../theme';
import { Container } from 'native-base';
import AppData from '../components/AppData';
import CONST from '../Const';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import API from '../components/api';
import Spinner from 'react-native-loading-spinner-overlay'
import firebase from 'react-native-firebase'

export default class splash extends Component {

    constructor(props) {
        super(props)

        this.state = {
            loading: false
        }
    }

    async componentDidMount() {
      
        this.setState({loading: true})
        // Firebase Notification.
        let enabled = await firebase.messaging().hasPermission()
        if(!enabled) await firebase.messaging().requestPermission()

        // Check user data.
        let name = await AppData.getItem(CONST.USER_KEY)
        let code = await AppData.getItem(CONST.CODE_KEY)
        let role = await AppData.getItem(CONST.ROLE_KEY)
        let password = await AppData.getItem(CONST.PASSWORD_KEY)
        var token = await AppData.getItem(CONST.TOKEN_KEY)
        if (token == '' || token == null) {
            token = await firebase.messaging().getToken()
            await AppData.setItem(CONST.TOKEN_KEY, token)
        }

        global.user = {
            name: name,
            role: role,
            code: code,
            token: token,
            password: password,
            url: "https://"+code+".myspapp.com/",
        }

        let con = await API.getConnection();

        this.setState({loading: false})

        var screen = 'CheckcodeScreen'
        if(con == true) {
            if(user.name == '' || user.name == null) {
                screen = 'LoginScreen'
            } else {
                screen = 'HomeScreen'
            }
            if (user.code == '' || user.code == null) {
                screen = 'CheckcodeScreen'
            }
        } else {
            alert('Not Network Connected!')
        }

        setTimeout(()=>{
            this.props.navigation.replace(screen.toString())
        }, 300)
    }
    

    render() {
        return (
            <Container style={styles.container}>
                <ImageBackground source={Images.bg}  style={styles.image}>
                    <Image source={Images.logo} style={{width: responsiveWidth(100), height: responsiveWidth(80)}}></Image>
                </ImageBackground>
                <Spinner
                    visible={this.state.loading}
                    textContent={''}
                    textStyle={styles.spinnerTextStyle}
                />
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch'
    },
    image: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
});