'use strict';

import React from 'react';

import PropTypes from 'prop-types';

import {
  View,
  WebView,
} from 'react-native';

import BaseComponent from './BaseComponent'
import Utils from './Utils'
import Spinner from 'react-native-loading-spinner-overlay';

import styles from './styles'

import BackButton from './BackButton'
import StatusBar from './StatusBar'
import AddressBar from './AddressBar'
import Toolbar from './Toolbar'

const WEBVIEW_REF = 'webview';

const propTypes = {
    url: PropTypes.string,
    hideToolbar: PropTypes.bool,
    hideAddressBar: PropTypes.bool,
    hideStatusBar: PropTypes.bool,
    hideRefreshButton: PropTypes.bool,
    hideActivityIndicator: PropTypes.bool,
    foregroundColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    onNavigationStateChange: PropTypes.func,
    onShouldStartLoadWithRequest: PropTypes.func,
    backButtonVisible: PropTypes.bool,
    onBackPress: PropTypes.func,
    jsCode: PropTypes.string,
    cookie: PropTypes.string
}

const defaultProps = {
    url: '',
    hideToolbar: false,
    hideAddressBar: false,
    hideStatusBar: false,
    hideRefreshButton: false,
    hideActivityIndicator: false,
    onNavigationStateChange: ()=>{},
    onShouldStartLoadWithRequest: ()=>true,
    backButtonVisible: true,
    jsCode: null,
    cookie: ''
}

class Webbrowser extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            status: '',
            currentUrl: Utils.sanitizeUrl(this.props.url),
            url: Utils.sanitizeUrl(this.props.url),
            backButtonEnabled: false,
            forwardButtonEnabled: false,
            homeButtonEnabled: true,
            loading: true,
            scalesPageToFit: true,
            jsCode: this.props.jsCode,
            cookie: this.props.cookie
        };

        this._bind(
            'render',
            'goBack',
            'goHome',
            'goForward',
            'reload',
            'onNavigationStateChange',
            'onShouldStartLoadWithRequest',
            'renderToolbar'
        );
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            url: Utils.sanitizeUrl(nextProps.url)
        });
    }

    renderAddressBar() {

        if (this.props.hideAddressBar) {
            return;
        };

        return <AddressBar
            onReload={this.reload}
            onLoad={(url)=>{this.load(url)}}
            url={this.state.currentUrl}
            foregroundColor={this.props.foregroundColor}
        />
    }

    renderBackButton() {
        console.log('backButtonVisible = ', this.props.backButtonVisible)
        console.log('onBackPress = ', this.props.onBackPress)

      return (
        <BackButton
          visible={this.props.backButtonVisible}
          onPress={this.props.onBackPress}
          foregroundColor={this.props.foregroundColor}
          />
      );
    }

    renderStatusBar() {

        if (this.props.hideStatusBar) {
            return;
        };

        return <StatusBar
            status={this.state.status}
            foregroundColor={this.props.foregroundColor}
        />
    }

    renderToolbar() {

        if (this.props.hideToolbar) {
            return;
        };

        return <Toolbar
            onBack={this.goBack}
            onHome={this.reload}
            onForward={this.goForward}
            backButtonEnabled={this.state.backButtonEnabled}
            forwardButtonEnabled={this.state.forwardButtonEnabled}
            hideRefreshButton={this.props.hideRefreshButton}
            foregroundColor={this.props.foregroundColor}
        />;
    }

    render() {
        return (
            <View style={[styles.container, this.props.backgroundColor && {backgroundColor: this.props.backgroundColor}]}>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row' }}>
                      {/* {this.renderBackButton()} */}
                      {this.renderAddressBar()}
                    </View>
                    {this.renderStatusBar()}
                </View>
                <WebView
                    ref={WEBVIEW_REF}
                    automaticallyAdjustContentInsets={false}
                    style={styles.webView}
                    source={{uri: this.state.url}}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    decelerationRate="normal"
                    onNavigationStateChange={this.onNavigationStateChange}
                    onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                    startInLoadingState={true}
                    scalesPageToFit={this.state.scalesPageToFit}
                    onLoad={() => this.refs[WEBVIEW_REF].postMessage(this.state.cookie)}
                    { ...(this.state.jsCode ? {injectedJavaScript : this.state.jsCode} : {}) }
                />
                {this.renderToolbar()}
                {/* <Spinner visible={this.state.loading} animation={fade}/> */}
            </View>
        );
    }

    goBack() {
        this.refs[WEBVIEW_REF].goBack();
    }

    goForward() {
        this.refs[WEBVIEW_REF].goForward();
    }

    goHome() {
        this.load(this.props.url);
    }

    load(url) {
        this.setState({
            url
        });
    }

    reload() {
        this.refs[WEBVIEW_REF].reload();
    }

    onShouldStartLoadWithRequest(event) {
        return this.props.onShouldStartLoadWithRequest(event);
    }

    onNavigationStateChange(navState) {

        this.setState({
            backButtonEnabled: navState.canGoBack,
            forwardButtonEnabled: navState.canGoForward,
            currentUrl: navState.url,
            status: navState.title,
            loading: navState.loading,
            scalesPageToFit: true
        });

        this.props.onNavigationStateChange(navState);
    }
}

Webbrowser.propTypes = propTypes;
Webbrowser.defaultProps = defaultProps;

export default Webbrowser;
