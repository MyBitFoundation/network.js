const Web3 = require('web3');

class Web3EventsListener {
    constructor() {
        this.activeEvents = {};
        this.web3Obj = null;
        this.subscriberId = 0;
        this.setEvent = this.setEvent.bind(this);
        this.subscriber = this.subscriber.bind(this);
        this.subscribeToLogs = this.subscribeToLogs.bind(this);
        this.subscribeToPendingTransactions = this.subscribeToPendingTransactions.bind(this);
        this.subscribeToNewBlockHeaders = this.subscribeToNewBlockHeaders.bind(this);
        this.subscribeToSyncing = this.subscribeToSyncing.bind(this);
        this.unSubscribe = this.unSubscribe.bind(this);
    }

    setEvent (type, params, cb, eventEmitter) {
      if (!this.web3Obj) {
        const web3Provider = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
        this.web3Obj = new Web3(web3Provider);
      }

      const errCb = (err) => {
        /* eslint no-console: ["error", { allow: ["log", "error"] }] */
        if (err) console.log(err);
      }

      let eventSubscription;

      if(params) {
          eventSubscription =  this.web3Obj.eth.subscribe(type, params, errCb);
      } else {
        eventSubscription = this.web3Obj.eth.subscribe(type, errCb)
      }
     
      return eventSubscription.on(eventEmitter, result => cb(result));
    }
  
    subscriber(event, setEvent) {
      this.subscriberId = this.subscriberId + 1;
      this.activeEvents[event] = this.activeEvents[event] || {};
      this.activeEvents[event][this.subscriberId] = setEvent();
      console.log(this.activeEvents, 'activeEvents') 
       return this.subscriberId;
    }
    
    subscribeToLogs(event, params, cb, eventEmitter = 'data') {
        return this.subscriber(event, () => this.setEvent(
            'logs',
            {
                address: [params.address],
                topics: [params.topics],
            },
            cb, 
            eventEmitter
        ));
    }
    
    subscribeToPendingTransactions(event, cb, eventEmitter = 'data') {
        return this.subscriber(event, () => this.setEvent(
            'pendingTransactions',
            null,
            cb, 
            eventEmitter
        ));
    };

    subscribeToNewBlockHeaders(event, cb, eventEmitter = 'data'){
        return this.subscriber(event, () => this.setEvent(
            'newBlockHeaders',
            null,
            cb, 
            eventEmitter
        ))
    };

    subscribeToSyncing(event, cb, eventEmitter = 'data') {
        return this.subscriber(event, () => this.setEvent(
            'syncing',
            null,
            cb, 
            eventEmitter
        ))
    };
    
    unSubscribe(event, subscriberId) {
      const currentEvent = this.activeEvents[event] || {};
      if (currentEvent[subscriberId]) {
        currentEvent[subscriberId].unsubscribe((error) => {
          if (error) {
            /* eslint no-console: ["error", { allow: ["log", "error"] }] */
            console.log(error);
          }
        });
        delete this.activeEvents[event][subscriberId];
      }
       return null;
    }
  };

  module.exports = Web3EventsListener;