'use strict';

import React, { Component, PropTypes } from 'react';
import {Pagination} from 'react-bootstrap';

class JingPagination extends Component {
    handleSelect(event, selectedEvent){
        this.props.onPageChange(selectedEvent.eventKey);
    }
    render() {
        const {pageNo, pageSize, dataSize} = this.props;
        const items = Math.ceil(dataSize/pageSize);
        return (
            <Pagination prev next first last ellipsis
            items={items}
            maxButtons={15}
            activePage={pageNo}
            onSelect={this.handleSelect} />
        );
    }
}

JingPagination.propTypes = {
    dataSize: PropTypes.Number.isRequired,
    pageNo: PropTypes.Number.isRequired,
    pageSize: PropTypes.Number.isRequired,
    onPageChange: PropTypes.func.isRequired
};

export default JingPagination;
