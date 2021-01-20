import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    KeyboardAvoidingView,
    StyleSheet,
    TouchableOpacity,
    Alert
} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader'

export default class ExchangeScreen extends Component {
    constructor() {
        super();
        this.state = {
            userId: firebase.auth().currentUser.email,
            itemName: "",
            itemDescription: ""
        }
    }

    createUniqueId() {
        return Math.random().toString(36).substring(7);
    }



    addRequest = (itemName, itemDescription) => {
        var userId = this.state.userId
        var randomRequestId = this.createUniqueId()
        db.collection('requested_items').add({
            "user_id": userId,
            "item_name": itemName,
            "item_description": itemDescription,
            "request_id": randomRequestId,
            'request_status': 'Open'
        })

        this.setState({
            itemName: '',
            itemDescription: ''
        })

        return alert("Item Requested Successfully")
    }


    render() {
        return (
            <View style={{ flex: 1 }}>
                <MyHeader title="Exchange" navigation={this.props.navigation} />
                <KeyboardAvoidingView style={styles.keyBoardStyle}>
                    <TextInput
                        style={styles.formTextInput}
                        placeholder={"Enter item name"}
                        onChangeText={(text) => {
                            this.setState({
                                itemName: text
                            })
                        }}
                        value={this.state.itemName}
                    />
                    <TextInput
                        style={[styles.formTextInput, { height: 300 }]}
                        multiline
                        numberOfLines={8}
                        placeholder={"Enter item description"}
                        onChangeText={(text) => {
                            this.setState({
                                itemDescription: text
                            })
                        }}
                        value={this.state.itemDescription}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => { this.addRequest(this.state.itemName, this.state.itemDescription) }}
                    >
                        <Text>Request</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    keyBoardStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    formTextInput: {
        width: "75%",
        height: 35,
        alignSelf: 'center',
        borderColor: 'blue',
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 20,
        padding: 10,
        textAlign: 'center',
        fontSize:20
    },
    button: {
        width: "75%",
        height: 50,
        fontSize:20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: "#ff5722",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        elevation: 16,
        marginTop: 20
    },
}
)