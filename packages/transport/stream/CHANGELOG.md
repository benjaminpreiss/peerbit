# Changelog

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/crypto bumped from 1.0.0 to 1.0.1
    * @peerbit/stream-interface bumped from ^1.0.0 to ^1.0.1

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/crypto bumped from 1.0.1 to 1.0.2
    * @peerbit/stream-interface bumped from ^1.0.1 to ^1.0.2

### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 1.0.2 to 1.0.3

## [1.0.20](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.19...stream-v1.0.20) (2023-09-24)


### Bug Fixes

* don't wait for direct dials ([89fd6ba](https://github.com/dao-xyz/peerbit/commit/89fd6ba557806fc8a8229006099b9ca654eb9fe4))

## [1.0.19](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.18...stream-v1.0.19) (2023-09-21)


### Bug Fixes

* cleanup test code ([9fa9266](https://github.com/dao-xyz/peerbit/commit/9fa9266eb423083b5e81b7a492ef3c6ca990366f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/crypto bumped from 1.0.9 to 1.0.10
    * @peerbit/stream-interface bumped from ^1.0.10 to ^1.0.11
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 1.0.7 to 1.0.8

## [1.0.18](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.17...stream-v1.0.18) (2023-09-13)


### Bug Fixes

* correctly return on missing protocols ([105bc24](https://github.com/dao-xyz/peerbit/commit/105bc2476b661e02d3e7fab8d5a11ac0c11c37f1))
* refactor test ([39ce150](https://github.com/dao-xyz/peerbit/commit/39ce150222f760707cb690b7e7784ac3a33b6c28))

## [1.0.17](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.16...stream-v1.0.17) (2023-09-12)


### Bug Fixes

* only listen to webrtc connection-open events ([8c8718a](https://github.com/dao-xyz/peerbit/commit/8c8718a81ff44fb03a948bc284429123a05945dd))
* wait for webrtc directions to support protocol ([987c457](https://github.com/dao-xyz/peerbit/commit/987c457707cf7e6c7e4239f67720dab358ac0815))

## [1.0.16](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.15...stream-v1.0.16) (2023-09-10)


### Bug Fixes

* listen for new connections outside topology to capture webrtc connection ([5a50682](https://github.com/dao-xyz/peerbit/commit/5a50682e5b1e9fd1d77c1d2bfc1d29bea908d608))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/cache bumped from 1.1.0 to 1.1.1
    * @peerbit/crypto bumped from 1.0.8 to 1.0.9
    * @peerbit/stream-interface bumped from ^1.0.9 to ^1.0.10
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 1.0.6 to 1.0.7

## [1.0.15](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.14...stream-v1.0.15) (2023-09-07)


### Bug Fixes

* allow incoming streams to run on transient connection ([ece5005](https://github.com/dao-xyz/peerbit/commit/ece5005fbaaf32fe82cb0456f56b05d841f494b9))

## [1.0.14](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.13...stream-v1.0.14) (2023-09-06)


### Bug Fixes

* handle overflow from invalid payload decoding ([d19b2e7](https://github.com/dao-xyz/peerbit/commit/d19b2e79597111cc47592e85d577d8456571c4b2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/crypto bumped from 1.0.7 to 1.0.8
    * @peerbit/stream-interface bumped from ^1.0.8 to ^1.0.9

## [1.0.13](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.12...stream-v1.0.13) (2023-09-06)


### Bug Fixes

* update to 0.46.9 ([f6bf439](https://github.com/dao-xyz/peerbit/commit/f6bf4398e4caf7472cdfa4296990d0518c295e4c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/crypto bumped from 1.0.6 to 1.0.7
    * @peerbit/stream-interface bumped from ^1.0.7 to ^1.0.8
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 1.0.5 to 1.0.6

## [1.0.12](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.11...stream-v1.0.12) (2023-09-03)


### Bug Fixes

* prevent slow writes to block fast writes ([b01eecc](https://github.com/dao-xyz/peerbit/commit/b01eeccf992bbda45886644df352e7accf66c819))

## [1.0.11](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.10...stream-v1.0.11) (2023-09-03)


### Bug Fixes

* downgrade to libp2p 0.46.6 ([bd7418e](https://github.com/dao-xyz/peerbit/commit/bd7418e0f36867ea5995abde98ecfd3880ccfaaf))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 1.0.4 to 1.0.5

## [1.0.10](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.9...stream-v1.0.10) (2023-09-02)


### Bug Fixes

* trailing comma formatting ([80a679c](https://github.com/dao-xyz/peerbit/commit/80a679c0dc0e7c8ac01538cb11458299fdb334d5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/cache bumped from 1.0.2 to 1.1.0
    * @peerbit/crypto bumped from 1.0.5 to 1.0.6
    * @peerbit/stream-interface bumped from ^1.0.6 to ^1.0.7
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 1.0.3 to 1.0.4

## [1.0.8](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.7...stream-v1.0.8) (2023-08-06)


### Bug Fixes

* typo change recieve to receive ([9b05cfc](https://github.com/dao-xyz/peerbit/commit/9b05cfc9220f6d8206626f5208724e3d0f34abe2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/crypto bumped from 1.0.4 to 1.0.5
    * @peerbit/stream-interface bumped from ^1.0.5 to ^1.0.6

## [1.0.7](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.6...stream-v1.0.7) (2023-07-28)


### Bug Fixes

* fix graphology version ([aa549c9](https://github.com/dao-xyz/peerbit/commit/aa549c9a1fcfb0b78ba30a9a555e5e952634681b))

## [1.0.6](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.5...stream-v1.0.6) (2023-07-18)


### Bug Fixes

* correctly ignore undefined stream ([b297c19](https://github.com/dao-xyz/peerbit/commit/b297c190dde46617a158e8bd5bb182ac5dbe71af))
* refactor ([751a3f3](https://github.com/dao-xyz/peerbit/commit/751a3f365f405b332a227203f65d4b3e278ca49d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/cache bumped from 1.0.1 to 1.0.2
    * @peerbit/crypto bumped from 1.0.3 to 1.0.4
    * @peerbit/stream-interface bumped from ^1.0.4 to ^1.0.5
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 1.0.1 to 1.0.2

## [1.0.5](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.4...stream-v1.0.5) (2023-07-04)


### Bug Fixes

* rm postbuild script ([b627bf0](https://github.com/dao-xyz/peerbit/commit/b627bf0dcdb99d24ac8c9055586e72ea2d174fcc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/cache bumped from 1.0.0 to 1.0.1
    * @peerbit/crypto bumped from 1.0.2 to 1.0.3
    * @peerbit/stream-interface bumped from ^1.0.3 to ^1.0.4
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 1.0.0 to 1.0.1

## [1.0.4](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.3...stream-v1.0.4) (2023-06-30)


### Bug Fixes

* purge old hellos ([46da9dc](https://github.com/dao-xyz/peerbit/commit/46da9dc22e7c94d12c61cc0b5ffc4d1eff487300))

## [1.0.3](https://github.com/dao-xyz/peerbit/compare/stream-v1.0.2...stream-v1.0.3) (2023-06-29)


### Bug Fixes

* peer stream event types ([7607d7d](https://github.com/dao-xyz/peerbit/commit/7607d7de837813441a81f477b91ceeaba65a108f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/stream-interface bumped from ^1.0.2 to ^1.0.3

## 1.0.0 (2023-06-28)


### ⚠ BREAKING CHANGES

* rename org on utility modules
* reuse pubsub message id on rpc messages
* client abstraction

### Features

* client abstraction ([6a1226d](https://github.com/dao-xyz/peerbit/commit/6a1226d4f8fc6deb167bff86cf7bdd6227c01a6b))
* reuse pubsub message id on rpc messages ([57bede7](https://github.com/dao-xyz/peerbit/commit/57bede71cd822c71b439bd8011b6f25bff1da5cb))


### Bug Fixes

* rename org on utility modules ([0e09c8a](https://github.com/dao-xyz/peerbit/commit/0e09c8a29487205e02e45cc7f1e214450f96cb38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/cache bumped from 0.0.7 to 1.0.0
    * @peerbit/crypto bumped from 1.0.4 to 1.0.0
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 1.0.4 to 1.0.0

## [1.0.4](https://github.com/dao-xyz/peerbit/compare/libp2p-direct-stream-v1.0.3...libp2p-direct-stream-v1.0.4) (2023-06-15)


### Bug Fixes

* bump dependencies ([8a8fd44](https://github.com/dao-xyz/peerbit/commit/8a8fd440149a966337382db77afe1071141e5c74))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/cache bumped from 0.0.6 to 0.0.7
    * @peerbit/crypto bumped from 1.0.3 to 1.0.4
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 1.0.3 to 1.0.4

## [1.0.3](https://github.com/dao-xyz/peerbit/compare/libp2p-direct-stream-v1.0.0-alpha1...libp2p-direct-stream-v1.0.3) (2023-06-14)


### Bug Fixes

* update invalid versions from prerelease release-please ([e2f6411](https://github.com/dao-xyz/peerbit/commit/e2f6411d46edf6d36723ca1ea81d1e55a09d3cd4))
* update to libp2p 0.45.9 ([0420543](https://github.com/dao-xyz/peerbit/commit/0420543084d82ab08084894f24c1dff340ba6c9b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/crypto bumped from 1.0.2 to 1.0.3
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 1.0.2 to 1.0.3

## [1.0.0-alpha1](https://github.com/dao-xyz/peerbit/compare/libp2p-direct-stream-v1.0.0-alpha1...libp2p-direct-stream-v1.0.0-alpha1) (2023-06-14)


### Bug Fixes

* update to libp2p 0.45.9 ([0420543](https://github.com/dao-xyz/peerbit/commit/0420543084d82ab08084894f24c1dff340ba6c9b))

## 1.0.0-alpha1 (2023-06-14)


### ⚠ BREAKING CHANGES

* simplified identity handling

### Features

* simplified identity handling ([1ae2416](https://github.com/dao-xyz/peerbit/commit/1ae24168a5c8629b8f9d1c57eceed6abd4a15020))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @peerbit/crypto bumped from 0.1.16 to 1.0.0-alpha1
  * devDependencies
    * @peerbit/libp2p-test-utils bumped from 0.5.3 to 1.0.0-alpha1

## @peerbit/stream [0.5.3](https://github.com/dao-xyz/peerbit/compare/@peerbit/stream@0.5.2...@peerbit/stream@0.5.3) (2023-06-07)


### Bug Fixes

* add release cfg ([de76654](https://github.com/dao-xyz/peerbit/commit/de766548f8106804d319e8b51e9607f2a3f60726))





### Dependencies

* **@peerbit/cache:** upgraded to 0.0.6
* **@peerbit/crypto:** upgraded to 0.1.16
* **@peerbit/libp2p-test-utils:** upgraded to 0.5.3
