var DEBUG_DASH_AIRDROP = {};
$(function () {
  'use strict';

  var config = {
    insightBaseUrl: 'https://api.dashdrop.coolaj86.com/insight-api-dash'
  , numWallets: 10
  };
  var data = {
    publicKeys: [ "XxgsFAhob6q8LuhsSWw7EDeYuU5ksmdnbr" ]
  };

  var bitcore = require('bitcore-lib-dash');
  var privateKey = new bitcore.PrivateKey();
  var wif = privateKey.toWIF();
  var addr = privateKey.toAddress.toString();

  var DashDom = {};
  var DashDrop = {};
  DashDrop._toAddress = function (sk) {
    return ;//.toString();
  };

  // opts = { uxto, src, dsts, amount, fee }
  DashDrop.load = function (opts) {
    var tx = new bitcore.Transaction();

    opts.dsts.forEach(function (privateKey) {
      tx.to(new bitcore.PrivateKey(privateKey).toAddress(), opts.amount);
    });
    tx.change(new bitcore.PrivateKey(opts.src).toAddress());
    opts.utxos.forEach(function (utxo) {
      tx.from(utxo);
    });
    if ('undefined' !== typeof opts.fee) {
      tx.fee(opts.fee);
    }
    return tx.sign(new bitcore.PrivateKey(opts.src)).serialize();
  };

  // opts = { srcs, dst, fee }
  DashDrop.claim = function (opts) {
    var tx = new bitcore.Transaction();
    var inputs = [];
    console.log('Instant Send Fee (per input):', 0.001 * satoshio);
    // NOTE: In dash the fee is 0.001 per input according to
    // https://github.com/dashevo/insight-api-dash#instantsend-transactions
    //var perKbFee = Math.round(0.00001 * satoshio);
    //var instant = 1; // 1 = off, 10 = on
    var bytes;
    var fee;
    var firstTime = true;
    var total;

    addresses.forEach(function (privateKey) {
      tx.to(privateKey.toAddress(), giveaway);
    });
    tx.change(genKeyPair().toAddress());
    // TODO sort for efficiency (try to not make change)
    // the smallest amount that is greater than the sum + fee
    // or the most change used without incurring a greater fee
    resp.body.forEach(function (utxo) {
      var fee1;
      var ft;
      if (utxo.confirmations < 6) {
        return false;
      }
      if (firstTime) {
        ft = true;
        firstTime = false;
        inputs.push(utxo);
        tx.from(utxo);
      }
      bytes = (148 * (inputs.length || 1)) + (34 * count) + 10;
      //fee1 = instant * bytes * perKbFee;
      fee1 = tx.getFee();
      console.log('fee1', fee1);
      if (sum >= (giveaway * count) + fee1) {
        console.log(inputs.length + ' input(s) will cover it');
        return true;
      }
      fee = fee1;
      if (!ft) {
        inputs.push(utxo);
        tx.from(utxo);
      }
      sum += utxo.satoshis; // Math.round(utxo.amount * satoshio);
    });
    total = (giveaway * count) + fee;
    if (sum < total) {
      throw new Error("not enough money!");
    }
    console.log('sources total:', sum);
    console.log('to be spent:', total);
    console.log('change:', sum - total);
    console.log('transaction:');
    var rawTx = tx.sign(privateKey).serialize();
    console.log(rawTx);
  };

  console.log('New Key:');
  console.log('Share:', addr);
  console.log('Secret:', wif);
  console.log('');

  //
  // Insight Base URL
  //
  $('.js-insight-base').val(config.insightBaseUrl);
  $('body').on('change', '.js-insight-base', function () {
    config.insightBaseUrl = $('.js-insight-base').val().replace(/\/+$/, '');
    //$('.js-insight-base').text(config.insightBaseUrl);
  });

  //
  // Generate Wallets
  //
  DashDom.generateWallets = function () {
    config.numWallets = $('.js-airdrop-count').val();
    var i;
    var keypair;

    data.privateKeys = [];
    data.publicKeys = [];
    for (i = 0; i < config.numWallets; i += 1) {
      keypair = new bitcore.PrivateKey();
      data.privateKeys.push( keypair.toWIF() );
      data.publicKeys.push( keypair.toAddress().toString() );
    }

    $('.js-dst-public-keys').val(data.publicKeys.join('\n'));
    $('.js-dst-private-keys').val(data.privateKeys.join('\n'));
  };

  $('.js-airdrop-count').val(config.numWallets);
  $('.js-airdrop-count').text(config.numWallets);
  DashDom.generateWallets();
  $('body').on('change', '.js-dst-public-keys', function () {
    data.publicKeys = [];
    data.publicKeysMap = {};
    data.privateKeys = [];
    $('.js-dst-public-keys').val().trim().split(/[,\n\r\s]+/mg).forEach(function (key) {
      if (34 === key.length) {
        data.publicKeysMap[key] = true;
        data.publicKeys.push(key);
        console.log('addr', key);
      } else if (52 === key.length) {
        data.privateKeys.push(key);
        console.log('skey', key);
      } else {
        console.error("Invalid Key:", key);
      }
    });
    data.privateKeys.forEach(function (skey) {
      var addr = new bitcore.PrivateKey(skey).toAddress().toString();
      data.publicKeysMap[addr] = true;
    });
    data.publicKeys = Object.keys(data.publicKeysMap);

    $('.js-dst-public-keys').val(data.publicKeys.join('\n'));
    $('.js-dst-private-keys').val(data.privateKeys.join('\n'));

    $('.js-airdrop-count').val(data.publicKeys.length);
    $('.js-airdrop-count').text(data.publicKeys.length);
    config.numWallets = data.publicKeys.length;

    console.log('private keys:', data.privateKeys);
    console.log('public keys:', data.publicKeys);

    // TODO store in localStorage
  });
  $('body').on('change', '.js-airdrop-count', function () {
    var count = $('.js-airdrop-count').val();
    $('.js-airdrop-count').text(count);
  });
  $('body').on('click', '.js-airdrop-generate', DashDom.generateWallets);

  //
  // Load Private Wallet
  //
  DashDom.updatePrivateKey = function () {
    data.wif = $('.js-src-private-key').val();
    localStorage.setItem('private-key', data.wif);
    var addr = new bitcore.PrivateKey(data.wif).toAddress().toString();

    var url = config.insightBaseUrl + '/addrs/:addrs/utxo'.replace(':addrs', addr);
    window.fetch(url, { mode: 'cors' }).then(function (resp) {
      resp.json().then(function (arr) {
        data.sum = 0;
        data.utxos = arr;
        arr.forEach(function (utxo) {
          if (utxo.confirmations >= 6) {
            data.sum += utxo.satoshis;
          }
        });
        $('.js-src-amount').text(data.sum);
        if (!data.amount) {
          data.amount = Math.floor(data.sum/config.numWallets);
          $('.js-airdrop-amount').val(data.amount);
          $('.js-airdrop-amount').text(data.amount);
        }

        DashDom.updateAirdropAmount();
      });
    });
  };
  DashDom.updateAirdropAmount = function () {
    var err;
    data.amount = parseInt($('.js-airdrop-amount').val(), 10);
    if (!data.sum || data.amount > data.sum) {
      err = new Error("Insufficient Funds: Cannot load " + data.amount + " mDash onto each wallet.");
      window.alert(err.message);
      throw err;
    }
  };

  data.wif = localStorage.getItem('private-key');
  if (data.wif) {
    $('.js-src-private-key').val(data.wif);
    DashDom.updatePrivateKey();
  }
  $('body').on('change', '.js-src-private-key', DashDom.updatePrivateKey);
  $('body').on('change', '.js-airdrop-amount', DashDom.updateAirdropAmount);
  $('body').on('click', '.js-airdrop-load', function () {
    data.privateKeys.forEach(function (sk) {
      var amount = parseInt(localStorage.getItem('dash:' + sk), 10) || 0;
      localStorage.setItem('dash:' + sk, amount);
    });

    var tx = DashDrop.load({
      utxos: data.utxos
    , src: data.wif
    , dsts: data.privateKeys.slice()
    , amount: data.amount
    , fee: data.fee || 0
    });
    console.log('transaction:');
    console.log(tx);

    /*
    data.privateKeys.forEach(function (sk) {
      var amount = parseInt(localStorage.getItem('dash:' + sk), 10) || 0;
      localStorage.setItem('dash:' + sk, amount + data.amount);
    });
    */
  });

  //
  // Reclaim Wallets
  //
  $('body').on('click', '.js-airdrop-inspect', function () {
    var addrs = data.publicKeys.join(',');
    var url = config.insightBaseUrl + '/addrs/:addrs/utxo'.replace(':addrs', addrs);
    window.fetch(url, { mode: 'cors' }).then(function (resp) {
      resp.json().then(function (val) {
        var ledger = '';
        console.log('resp.json():');
        console.log(val);
        val.forEach(function (v) {
          ledger += v.address + ' ' + v.satoshis + ' (*' + v.confirmations + ')' + '\n';
        });
        $('.js-airdrop-balances code').text(ledger);
        $('.js-airdrop-balances').addClass('in');
      });
    }, function (err) {
      console.error('Error:');
      console.error(err);
    });
  });

  DEBUG_DASH_AIRDROP.config = config;
  DEBUG_DASH_AIRDROP.data = data;
});
