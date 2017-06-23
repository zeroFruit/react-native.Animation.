import React, { Component } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPTE_OUT_DURATION = 500;
const SWIPE_LEFT = 'SWIPE_LEFT';
const SWIPE_RIGHT = 'SWIPE_RIGHT';

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  };

  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return true;
      },
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipeRight();
        } else if ( gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipeLeft();
        } else {
          this.resetPosition();
        }
      }
    });

    this.state = { panResponder, position, index: 0 };
  }

  forceSwipeRight() {
    Animated.timing(this.state.position, {
      toValue: { x: SCREEN_WIDTH, y: 0 },
      duration: SWIPTE_OUT_DURATION
    }).start(() => this.onSwipeComplete(SWIPE_RIGHT));
  }

  forceSwipeLeft() {
    Animated.timing(this.state.position, {
      toValue: { x: -SCREEN_WIDTH, y: 0 },
      duration: SWIPTE_OUT_DURATION
    }).start(() => this.onSwipeComplete(SWIPE_LEFT));
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];

    if (direction === SWIPE_RIGHT) {
      onSwipeRight(item);
    } else if (direction === SWIPE_LEFT) {
      onSwipeLeft(item);
    }

    this.resetPositionValue();
    this.increaseCardIndex();
  }

  resetPositionValue() {
    this.state.position.setValue({ x: 0, y: 0 });
  }

  increaseCardIndex() {
    this.setState({ index: this.state.index + 1 });
  }

  render() {
    return (
      <View>
        { this.renderCards() }
      </View>
    );
  }

  renderCards() {
    return this.props.data.map((item, i) => {
      if (i < this.state.index) {
        return null
      }
      if (i === this.state.index) {
        return (
          <Animated.View
            style={ this.getCardStyle() }
            { ...this.state.panResponder.panHandlers }
            key={ i }>
            { this.props.renderCard(item) }
          </Animated.View>
        );
      }

      return this.props.renderCard(item);
    })
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5 , 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    });

    return {
      ...this.state.position.getLayout(),
      transform: [{ rotate }]
    };
  }
}

export default Deck;
