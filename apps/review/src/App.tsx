import {
  ReviewApp
} from "./ReviewApp";

import {
  sampleHandReview
} from "./sample-hand-review";

import "./App.css";

function App() {
  return (
    <ReviewApp
      review={sampleHandReview}
    />
  );
}

export default App;