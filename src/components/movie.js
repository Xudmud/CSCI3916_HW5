import React, { Component }  from 'react';
import {connect} from "react-redux";
import { Glyphicon, Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import { Image } from 'react-bootstrap'
import { withRouter } from "react-router-dom";
import {fetchMovie} from "../actions/movieActions";
import runtimeEnv from '@mars/heroku-js-runtime-env';
import {Col, Form, FormGroup, FormControl, Button, ControlLabel } from 'react-bootstrap';
import qs from 'qs';

//support routing by creating a new component

//Add new review
class ReviewInput extends Component {
    constructor(props) {
        super(props);
        this.submitReview = this.submitReview.bind(this);
        this.updateDetails = this.updateDetails.bind(this);

        this.state = {
            details: {
                rating: 5,
                review: ""
            }
        }
    }

    submitReview() {
        const env = runtimeEnv();
        let details = {
            'movieId': this.props.movieId,
            'review': this.state.details.review,
            'rating': parseInt(this.state.details.rating)
        };
        let formBody = {};
        for (let property in details) {
            formBody[property] = details[property];
        }

        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        };
        console.log("headers: "+JSON.stringify(headers));
        console.log("body: "+JSON.stringify(formBody));
        let strBody = JSON.stringify(formBody);
        return fetch(`${env.REACT_APP_API_URL}/reviews`, {
            method: 'POST',
            mode: 'cors',
            headers: headers,
            body: strBody
        })
            .then((response) => {
                console.log("response: " + JSON.stringify(response));
                console.log("statusText: " + response.statusText);
                if (!response || !response.status) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then((res) => {
                console.log("res: " + JSON.stringify(res));
                //window.location.reload();
            })
            .catch((e) => console.log(e));

    }

    updateDetails(event) {
        let updateDetails = Object.assign({},this.state.details);
        updateDetails[event.target.id] = event.target.value;
        this.setState({
            details: updateDetails
        });
    }

    render() {
        return(
            <Form horizontal>
                <h3>Write a Review</h3>
                <FormGroup controlId="rating">
                    <Col componentClass={ControlLabel} sm={2}>
                        Rating
                    </Col>
                    <Col sm={10}>
                        <FormControl onChange={this.updateDetails}
                                     componentClass={"select"}
                                     placeholder={"rating"}
                                     value={this.state.details.rating}>
                        <option value={"5"}>&#9733;&#9733;&#9733;&#9733;&#9733;</option>
                        <option value={"4"}>&#9733;&#9733;&#9733;&#9733;</option>
                        <option value={"3"}>&#9733;&#9733;&#9733;</option>
                        <option value={"2"}>&#9733;&#9733;</option>
                        <option value={"1"}>&#9733;</option>
                        </FormControl>
                    </Col>
                </FormGroup>
                <FormGroup controlId={"review"}>
                    <Col componentClass={ControlLabel} sm={2}>
                        Review
                    </Col>
                    <Col sm={10}>
                        <FormControl onChange={this.updateDetails}
                                     value={this.state.details.review} componentClass={"textarea"}
                                     placeholder={"Type your review here."} />
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Button onClick={this.submitReview}>Submit</Button>
                </FormGroup>
            </Form>
        )
    }
}

class Movie extends Component {

    componentDidMount() {
        const {dispatch} = this.props;
        if (this.props.selectedMovie == null)
            dispatch(fetchMovie(this.props.movieId));
    }

    render() {
        const ActorInfo = ({actors}) => {
            return actors.map((actor, i) =>
                <p key={i}>
                    <b>{actor.name}</b> as {actor.role}
                </p>
            );
        };

        const ReviewInfo = ({reviews}) => {
            return reviews.map((review, i) =>
                <p key={i}>
                <b>{review.username}</b> - {review.review}
                    <Glyphicon glyph={'star'} /> {review.rating}
                </p>
            );
        };


        const DetailInfo = ({currentMovie}) => {
            if (!currentMovie) { // evaluates to true if currentMovie is null
                return <div>Loading...</div>;
            }
            return (
                <Panel>
                    <Panel.Heading>Movie Detail</Panel.Heading>
                    <Panel.Body><Image className="image" src={currentMovie.imageUrl} thumbnail /></Panel.Body>
                    <ListGroup>
                        <ListGroupItem>{currentMovie.title}</ListGroupItem>
                        <ListGroupItem><ActorInfo actors={currentMovie.actor} /></ListGroupItem>
                        <ListGroupItem><h4><Glyphicon glyph={'star'} /> {currentMovie.avgRating} </h4></ListGroupItem>
                    </ListGroup>
                    <Panel.Body><ReviewInfo reviews={currentMovie.reviews} /></Panel.Body>
                    <Panel.Body>
                        <h2>Add a review</h2>
                        <ReviewInput movieId={currentMovie._id} />
                    </Panel.Body>
                </Panel>
            );
        };
        return (
            <DetailInfo currentMovie={this.props.selectedMovie} />
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    console.log(ownProps);
    return {
        selectedMovie: state.movie.selectedMovie,
        movieId: ownProps.match.params.movieId
    }
}

export default withRouter(connect(mapStateToProps)(Movie));