import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Header, Icon } from 'react-native-elements';
import firebase from 'firebase';

import db from '../config.js';

export default class UserDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exchangeId: firebase.auth().currentUser.email,
            exchangerName: '',
            userId: this.props.navigation.getParam('details')["user_id"],
            requestId: this.props.navigation.getParam('details')["request_id"],
            itemName: this.props.navigation.getParam('details')["item_name"],
            item_description: this.props.navigation.getParam('details')["item_description"],
            userName: '',
            userContact: '',
            userAddress: '',
            userRequestDocId: '',
            updated: false
        }
    }

    getUserDetails() {
        db.collection('Users').where('emailId', '==', this.state.userId).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    this.setState({
                        userName: doc.data().firstName,
                        userContact: doc.data().contact,
                        userAddress: doc.data().address,
                    })
                })
            });

        db.collection('requested_items').where('request_id', '==', this.state.requestId).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    this.setState({ userRequestDocId: doc.id })
                })
            })
    }

    getExchangerDetails = (userId) => {
        db.collection("Users").where('emailId', '==', userId).get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    this.setState({
                        exchangerName: doc.data().firstName + " " + doc.data().lastName
                    })
                })
            })
    }

    updateItemStatus = () => {
        db.collection('requested_items').doc(this.state.userRequestDocId).update({
            requested_by: this.state.userName,
            exchangeId: this.state.exchangeId,
            request_status: "Exchanger Interested"
        })

        this.setState({ updated: false })
    }

    addNotification = () => {
        var message = this.state.exchangerName + " has shown interest in exchanging " + this.state.itemName
        db.collection("all_notifications").add({
            "targeted_user_id": this.state.userId,
            "exchangerId": this.state.exchangeId,
            "request_id": this.state.requestId,
            "itemName": this.state.itemName,
            "date": firebase.firestore.FieldValue.serverTimestamp(),
            "notification_status": "unread",
            "message": message
        })
    }

    componentDidMount() {
        this.getUserDetails();
        this.getExchangerDetails(this.state.exchangeId)
    }

    render() {
        return (
            <View style={styles.container}>
                <Header
                    leftComponent={<Icon name='arrow-left' type='feather' color='#696969' onPress={() => this.props.navigation.goBack()} />}
                    centerComponent={{ text: "Exchange Item", style: { color: '#90A5A9', fontSize: 20, fontWeight: "bold", } }}
                    backgroundColor="#eaf8fe"
                />
                <ScrollView>
                    <Card
                        title={"Item Information"}
                        titleStyle={{ fontSize: 20 }}
                    >
                        <Card >
                            <Text style={{ fontWeight: 'bold' }}>Name : {this.state.itemName}</Text>
                        </Card>
                        <Card>
                            <Text style={{ fontWeight: 'bold' }}>Reason : {this.state.item_description}</Text>
                        </Card>
                    </Card>
                    <Card
                        title={"User Information"}
                        titleStyle={{ fontSize: 20 }}
                    >
                        <Card>
                            <Text style={{ fontWeight: 'bold' }}>Name: {this.state.userName}</Text>
                        </Card>
                        <Card>
                            <Text style={{ fontWeight: 'bold' }}>Contact: {this.state.userContact}</Text>
                        </Card>
                        <Card>
                            <Text style={{ fontWeight: 'bold' }}>Address: {this.state.userAddress}</Text>
                        </Card>
                    </Card>
                </ScrollView>
                {
                    this.state.userId !== this.state.exchangeId
                        ? (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    this.setState({ updated: true })
                                    if (this.state.updated === true) {
                                        this.updateItemStatus();
                                        this.addNotification();
                                        this.props.navigation.navigate('MyExchanges')
                                    }
                                }}>
                                <Text>I want to Exchange</Text>
                            </TouchableOpacity>
                        )
                        : null
                }
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    button: {
        width: 200,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: 'orange',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8
        },
        alignSelf: 'center',
    }
})
