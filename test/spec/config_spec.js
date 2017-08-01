import { excpet } from 'chai';
const getConfig = $$PREBID_GLOBAL$$.getConfig;
const setConfig = $$PREBID_GLOBAL$$.setConfig;

let subscribers = [];
function resetConfig() {
  setConfig({});
  subscribers.forEach(unsubscribe => unsubscribe());
  subscribers = [];
}

describe('config API', () => {
  beforeEach(() => resetConfig());
  afterEach(() => resetConfig());

  it('setConfig is a function', () => {
    expect(setConfig).to.be.a('function');
  });

  it('getConfig returns an object', () => {
    expect(getConfig()).to.be.a('object');
  });

  it('sets and gets arbitrary configuarion properties', () => {
    setConfig({ baz: 'qux' });
    expect(getConfig('baz')).to.equal('qux');
  });

  it('sets debugging', () => {
    setConfig({ debug: true });
    expect(getConfig('debug')).to.be.true;
  });

  // remove test when @deprecated $$PREBID_GLOBAL$$.logging removed
  it('gets legacy logging in deprecation window', () => {
    $$PREBID_GLOBAL$$.logging = false;
    expect(getConfig('debug')).to.equal(false);
  });

  it('sets bidderTimeout', () => {
    setConfig({ bidderTimeout: 1000 });
    expect(getConfig('bidderTimeout')).to.be.equal(1000);
  });

  // remove test when @deprecated $$PREBID_GLOBAL$$.bidderTimeout removed
  it('gets legacy bidderTimeout in deprecation window', () => {
    $$PREBID_GLOBAL$$.bidderTimeout = 5000;
    expect(getConfig('bidderTimeout')).to.equal(5000);
  });

  it('gets user-defined publisherDomain', () => {
    setConfig({ publisherDomain: 'fc.kahuna' });
    expect(getConfig('publisherDomain')).to.equal('fc.kahuna');
  });

  // remove test when @deprecated $$PREBID_GLOBAL$$.publisherDomain removed
  it('gets legacy publisherDomain in deprecation window', () => {
    $$PREBID_GLOBAL$$.publisherDomain = 'ad.example.com';
    expect(getConfig('publisherDomain')).to.equal('ad.example.com');
  });

  it('has subscribe functionality for adding listeners to config updates', () => {
    const listener = sinon.spy();

    const unsubscribe = getConfig(listener);

    // done to automatically unsubscriber after each test
    subscribers.push(unsubscribe);

    setConfig({ foo: 'bar' });

    sinon.assert.calledOnce(listener);
    sinon.assert.calledWith(listener, { foo: 'bar' });
  });

  it('subscribers can subscribe to topics', () => {
    const listener = sinon.spy();

    const unsubscribe = getConfig('logging', listener);
    subscribers.push(unsubscribe);

    setConfig({ logging: true, foo: 'bar' });

    sinon.assert.calledOnce(listener);
    sinon.assert.calledWithExactly(listener, { logging: true });
  });

  it('topic subscribers are only called when that topic is changed', () => {
    const listener = sinon.spy();
    const wildcard = sinon.spy();

    const subjectUnsubscribe = getConfig('subject', listener);
    const wildcardUnsubscribe = getConfig(wildcard);
    subscribers.push(subjectUnsubscribe, wildcardUnsubscribe);

    setConfig({ foo: 'bar' });

    sinon.assert.notCalled(listener);
    sinon.assert.calledOnce(wildcard);
  });
});
