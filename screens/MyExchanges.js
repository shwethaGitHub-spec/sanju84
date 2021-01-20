import React, { Component } from 'react'
import { View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet } from 'react-native';
import { Card, Icon, ListItem } from 'react-native-elements'
import MyHeader from '../components/MyHeader.js'
import firebase from 'firebase';
import db from '../config.js'

export default class MyExchanges extends Component {
    static navigationOptions = { header: null };

    constructor() {
        super()
        this.state = {
            exchangeId: firebase.auth().currentUser.email,
            exchangerName: '',
            allExchanges: []
        }
        this.requestRef = null
    }


    getAllExchanges = () => {
        this.requestRef = db.collection("requested_items").where("exchangeId", '==', this.state.exchangeId)
            .onSnapshot((snapshot) => {
                var allExchanges = snapshot.docs.map(doc => doc.data());
                this.setState({
                    allExchanges: allExchanges,
                });
            })
    }

    getExchangerDetails = (exchangerId) => {
        db.collection("Users").where("emailId", "==", exchangerId).get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    this.setState({
                        exchangerName: doc.data().firstName + " " + doc.data().lastName
                    })
                });
            })
    }

    sendItem = (itemDetails) => {
        if (itemDetails.request_status != "Item Sent") {
            var requestStatus = "Item Sent"
            console.log(itemDetails.request_status)
            db.collection("requested_items").where('request_id', '==', itemDetails.request_id).get().then(snapshot => {
                snapshot.forEach(doc => {
                    console.log(doc.id);
                    db.collection('requested_items').doc(doc.id).update({
                        request_status: 'Item Sent'
                    })
                })
            })
            this.sendNotification(itemDetails)
        }
    }

    sendNotification = (itemDetails) => {
        var requestId = itemDetails.request_id
        var exchangeId = itemDetails.exchangeId
        console.log(requestId, exchangeId);
        db.collection("all_notifications")
            .where("request_id", "==", requestId)
            .get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    console.log(doc.id);
                    db.collection("all_notifications").doc(doc.id).update({
                        "message": this.state.exchangerName + ' has sent you ' + itemDetails.itemName,
                        "notification_status": "unread",
                        "date": firebase.firestore.FieldValue.serverTimestamp()
                    })
                });
            })
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item, i }) => (
        <ListItem
            key={i}
            title={item.itemName}
            subtitle={"Requested By : " + item.requested_by + "\nStatus : " + item.request_status}
            leftElement={<Icon name="stack-exchange" type="font-awesome" color='#696969' />}
            titleStyle={{ color: 'black', fontWeight: 'bold', marginLeft: 10 }}
            rightElement={
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: item.request_status === "Item Sent" ? "green" : "#ff5722"
                        }
                    ]}
                    onPress={() => {
                        this.sendItem(item)
                    }}
                >
                    <Text style={{ color: '#ffff' }}>{
                        item.request_status === "Item Sent" ? "Item Sent" : "Send Item"
                    }</Text>
                </TouchableOpacity>
            }
            bottomDivider
        />
    )


    componentDidMount() {
        this.getAllExchanges()
        this.getExchangerDetails(this.state.exchangeId)
    }

    componentWillUnmount() {
        this.requestRef();
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <MyHeader navigation={this.props.navigation} title="My Exchanges" />
                <View style={{ flex: 1 }}>
                    {
                        this.state.allExchanges.length === 0
                            ? (
                                <View style={styles.subtitle}>
                                    <Text style={{ fontSize: 20 }}>List of all item exchanges</Text>
                                </View>
                            )
                            : (
                                <FlatList
                                    keyExtractor={this.keyExtractor}
                                    data={this.state.allExchanges}
                                    renderItem={this.renderItem}
                                />
                            )
                    }
                </View>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    button: {
        width: 100,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#ff5722",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8
        },
        elevation: 16
    },
    subtitle: {
        flex: 1,
        fontSize: 20,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
