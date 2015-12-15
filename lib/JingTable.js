'use strict';

import React, { Component, PropTypes } from 'react';
import { Table, Pagination, Row, Col } from 'react-bootstrap';
import { Selector } from './JingInput';
import $ from 'jquery';
import _ from 'underscore';

// 分页组件
class PaginationBasic extends Component{
    handleSelect(event, selectedEvent){
        let page = selectedEvent.eventKey;
        this.props.onPageChange(page);
    }
    
    render() {
        const { size, per, page } = this.props ;
        let items = Math.ceil(size/per);
        return (
            <Pagination prev next first last ellipsis
            items={items}
            maxButtons={15}
            bsSize='small'
            activePage={page}
            onSelect={this.handleSelect.bind(this)} />
        );
    }
}

// 分单表格组件
class WcTable extends Component{
    constructor(props, context) {
        super(props, context);
        this.state = {
            datas:[],
            pageSize: 20,
            pageNo:1,
            selectRows:[],
            sort:{},
            sortHeader: null,
            checked:false
        }
    }

    initPageSize(datas){
        const { nopagination, pagelist } = this.props;
        const { pageSize } = this.state;
        var tpagesize = nopagination ? datas.length : (pagelist && pagelist.length > 0 ? parseInt(pagelist[0]) : pageSize);
        return tpagesize;
    }
    
    componentWillMount(){
        var { datas, method } = this.props;
        if(typeof datas === "string"){
            this.getDataByAjax(datas, method);
        }else{
            this.setState({datas: datas, dataLength: datas.length, pageSize: this.initPageSize(datas)});
        }
    }
    
    componentWillReceiveProps(nextProps){
        var datas = nextProps.datas;
        if(typeof datas === "string"){
            this.getDataByAjax(datas, nextProps.method);
        }else{
            var changed = _.isEqual(datas, this.state.datas);
            var tpagesize = this.initPageSize(datas);
            if(changed){
                this.setState({datas: datas, dataLength: datas.length, pageSize: tpagesize});
            }else{
                this.setState({datas: datas, dataLength: datas.length, pageSize: tpagesize, selectRows: [], checked: false});
            }
        }
    }
    
    getDataByAjax(url, method, pageNo, pageSize, sortHeader, sort){
        var self = this;
        var method = method || "post";
        var pageNo = pageNo || self.state.pageNo;
        var pageSize = pageSize || (self.props.pagelist && self.props.pagelist.length > 0 ? parseInt(self.props.pagelist[0]) : self.state.pageSize);
        $.ajax({
            url: url,
            type: method,
            data: JSON.stringify({
                pageSize: pageSize,
                pageNo: pageNo,
                sort: sortHeader || self.state.sortHeader || null,
                desc: (sort && sort[sortHeader]) || self.state.sort[self.state.sortHeader] || false
            }),
            dataType: 'json',
            success(data){
                if(data && data.ok){
                    self.setState({datas: data.rows, dataLength: data.total, pageNo: pageNo, pageSize: pageSize, checked: self.getAllCheckboxState(null, pageNo), sort: (sort ||{}), sortHeader: (sortHeader || null)});
                }else{
                    alert(data.msg);
                }
            },
            error(data){
                console.log(data);
            }
        });
    }
    
    getStartIndex(currentPage){
        var datas = this.state.datas;
        var currentpage = currentPage || this.state.pageNo, pagesize = this.state.pageSize;
        var startIndex = pagesize * (currentpage - 1);
        return startIndex >= datas.length ? 0 : startIndex;
    }
    
    getEndIndex(currentPage){
        var datas = this.state.datas;
        var pagesize = this.state.pageSize;
        var endIndex = parseInt(this.getStartIndex(currentPage)) + parseInt(pagesize);
        return endIndex >= datas.length ? datas.length : endIndex;
    }
    
    getCurrentPageData(currentpage){
        var currentPage = currentpage || this.state.pageNo;
        var datas = this.state.datas;
        var startIndex = this.getStartIndex(currentPage), endIndex = this.getEndIndex(currentPage);
        var currentPageDatas = datas.slice(startIndex, endIndex);
        return currentPageDatas;
    }
    
    handlePageChange(currentpage){
        if(typeof this.props.datas === "string"){
            this.getDataByAjax(this.props.datas, this.props.method, currentpage, this.state.pageSize);
        }else{
            this.setState({pageNo:currentpage, checked: this.getAllCheckboxState(null, currentpage)});
        }
    }
    
    handlePageSizeChange(value){
        var pageSize = value;
        if(typeof this.props.datas === "string"){
            this.getDataByAjax(this.props.datas, this.props.method, 1, pageSize);
        }else{
            this.setState({pageSize:pageSize, checked: this.getAllCheckboxState(null, 1)});
        }
    }
    
    handleAllRowSelect(){
        var selecteds = this.state.selectRows, pkey = this.props.pkey;
        var currentPageDatas = this.getCurrentPageData();
        var checked = !this.state.checked;
        for(var i in currentPageDatas){
            var data = currentPageDatas[i];
            var index = pkey ? _.indexOf(selecteds, data[pkey].toString()) : _.findIndex(selecteds, data);
            var selected = pkey ? data[pkey].toString() : data;
            if(index < 0 && checked){
                selecteds.push(selected);
            }else if(index >= 0 && !checked){
                selecteds.splice(index, 1);
            }
        }
        this.setState({selectRows: selecteds, checked: checked});
        this.props.onRowSelect(selecteds);
    }
    
    handleRowSelect(row){
        var selecteds = this.state.selectRows;
        var rowStr = row.target.value;
        var checked = row.target.checked;
        var pkey = this.props.pkey;
        var row = pkey ? rowStr : JSON.parse(rowStr);
        var selecteds = this.updateSelectRows(selecteds, row, checked);
        var allchecked = this.getAllCheckboxState(selecteds);
        this.setState({selectRows: selecteds, checked: allchecked});
        this.props.onRowSelect(selecteds);
    }
    
    updateSelectRows(selecteds, select, add){
        var pkey = this.props.pkey;
        if(add && (_.indexOf(selecteds, select) < 0 || _.findIndex(selecteds, select) < 0)){
            return selecteds.concat(select);
        }else if(!add){
            if(pkey){
                return _.without(selecteds, select);
            }else{
                selecteds.splice(_.findIndex(selecteds, select), 1);
                return selecteds;
            }
        }else{
            return selecteds;
        }
    }
    
    getAllCheckboxState(selectRows, currentpage){
        var currentPageDatas = this.getCurrentPageData(currentpage);
        var checked = currentPageDatas.length > 0;
        for(var i in currentPageDatas){
            var data = currentPageDatas[i];
            checked = this.getCurrentRowChecked(selectRows, data);
            if(!checked){
                break;
            }
        }
        return checked;
    }
    
    getCurrentRowChecked(selectRows, currentRow){
        var selecteds = selectRows || this.state.selectRows, pkey = this.props.pkey;
        return pkey ? (_.indexOf(selecteds, currentRow[pkey].toString()) >= 0) : (_.findIndex(selecteds, currentRow) >= 0);
    }
    
    handleHeaderClick(title, self){
        
        var sort = self.state.sort;
        var sortHeader = title;
        var sortHeaderDesc = sort[sortHeader] || false;
        sort[sortHeader] = !sortHeaderDesc;
        
        let { datas, method, pageSize } = self.props;
        let { pageNo } = self.state;
        if(typeof datas === "string"){
            this.getDataByAjax(datas, method, pageNo, pageSize, sortHeader, sort);
        }else{
            this.setState({sort: sort, sortHeader: sortHeader, checked: self.getAllCheckboxState()});
        }
    }
    
    handleRowClick(row, self){
        if(self.props.onDoubleClick){
            self.props.onDoubleClick(row);
        }else{
            console.log("Should set onDoubleClick prop！");
        }
    }
    
    dataSorter(dataA, dataB){
        var sort = this.state.sort;
        var sortHeader = this.state.sortHeader;
        var sortHeaderDesc = sort[sortHeader];
        
        var dA = dataA[sortHeader], dB = dataB[sortHeader];
        if(!dA || dA === undefined || dA == ""){dA = 0};
        if(!dB || dB === undefined || dB == ""){dB = 0};
        if(dA == dB){
            var pkey = this.props.pkey;
            if(pkey){
                dA = dataA[pkey]; 
                dB = dataB[pkey];
                if((typeof dA === "number" && typeof dB === "number") || (!(/[^0-9]+/g).test(dA) && !(/[^0-9]+/g).test(dB) && !isNaN(parseFloat(dA)) && !isNaN(parseFloat(dB)))){
                    return sortHeaderDesc ? dA - dB : dB - dA;
                }else{
                    if(dA > dB) return sortHeaderDesc ? 1 : -1;
                    else if( dA < dB) return sortHeaderDesc ? -1 : 1;
                    else return 0;
                }
            }else{
                return 0;
            }
        }else{
            if((typeof dA === "number" && typeof dB === "number") || (!(/[^0-9]+/g).test(dA) && !(/[^0-9]+/g).test(dB) && !isNaN(parseFloat(dA)) && !isNaN(parseFloat(dB)))){
                return sortHeaderDesc ? dA - dB : dB - dA;
            }else{
                if(dA > dB) return sortHeaderDesc ? 1 : -1;
                else if( dA < dB) return sortHeaderDesc ? -1 : 1;
                else return 0;
            }
        }
    }
    
    initHeader(){
        var self = this;
        var rownumbers = self.props.rownumbers;
        var checkbox = self.props.checkbox;
        var headers = self.props.header;
        var descheader;
        
        // 定义表头样式
        var style = self.props.trStyle || {
            height: 30,
            lineHeight: 30,
            textAlign: "center",
            fontWeight: "bold",
            color: "grey",
            verticalAlign: "middle",
            backgroundColor: "#eee",
            fontSize: "14",
            cursor: "pointer"
        };
        
        var tdStyle = self.props.tdStyle || {textAlign: "center"};
        
        if(headers.descheader){
            descheader = headers.descheader.map(function(hs, i){
                var header = [];
                if(rownumbers){
                    header.push(<th key={0}></th>);
                }
                if(checkbox){
                    header.push(<th key={1}></th>);
                }
                var ths = hs.map(function(h, j){
                    var colspan = h.colspan || 1;
                    var rowspan = h.rowspan || 1;
                    var title = h.title || "";
                    return <th key={j + 2} style={tdStyle} colSpan={colspan} rowSpan={rowspan}>{title}</th>;
                });
                header = header.concat(ths);
                return <tr key={i} style={style}>{header}</tr>;
            });
        }
        
        var dataheader = [];
        if(rownumbers){
            dataheader.push(<th key={0} style={tdStyle} width={30}></th>);
        }
        if(checkbox){
            dataheader.push(<th key={1} style={tdStyle} width={30}><input type='checkbox' key={"checkbox"} checked={self.state.checked} onChange={self.handleAllRowSelect.bind(self)}/></th>);
        }
        var header = headers.dataheader.map(function(h, k){
            var width = h.width || 100;
            if(h.sort){
                var sort = self.state.sort;
                var sortDesc = sort[h.key] || false;
                var sortIcon = sortDesc ? "↑" : "↓";
                return <th key={k + 2} style={tdStyle} width={width}><span onClick={function(){self.handleHeaderClick(h.key, self)}}>{h.title}</span>{sortIcon}</th>;
            }else{
                return <th key={k + 2} style={tdStyle} width={width}>{h.title}</th>;
            }
        });
        dataheader = dataheader.concat(header);
        var dataheadertr = <tr key={"dh"} style={style}>{dataheader}</tr>;
        style.fontSize = 12;
        return descheader ? (<thead>{descheader}{dataheadertr}</thead>) : (<thead>{dataheadertr}</thead>);
    }
    
    initData(){
        var self = this;
        var datas = self.state.datas;
        var datas = self.state.sortHeader !== null ? datas.sort(self.dataSorter.bind(self)) : datas;
        var rownumbers = self.props.rownumbers;
        var checkbox = self.props.checkbox;
        var dataLength = datas.length, pkey = self.props.pkey;
        var dataheader = self.props.header.dataheader;
        
        var rowRecords = [];
        
        var tdStyle = self.props.tdStyle || {textAlign: "center"};
        
        for(var index = self.getStartIndex(), dataIndex = 1; index < self.getEndIndex(); index++, dataIndex++){
            var rowRecord = [], rowdata = datas[index], rowkey = pkey ? rowdata[pkey].toString() : undefined;
            if(rownumbers){
                rowRecord.push(<td key={0} style={tdStyle}>{ dataIndex }</td>);
            }
            if(checkbox){
                var checked = self.getCurrentRowChecked(null, rowdata);
                rowRecord.push(<th key={1} style={tdStyle}><input checked={checked} key={dataIndex} type='checkbox' value={rowkey || JSON.stringify(rowdata)} onChange={self.handleRowSelect.bind(self)}/></th>);
            }
            for(var i in dataheader){
                var key = dataheader[i].key;
                var keyValue = (key == "" || key == "--") ? "" : datas[index][key];
                var filter = dataheader[i].filter, render = dataheader[i].render, style = dataheader[i].style;
                if(filter){
                    keyValue = filter(keyValue,rowdata,rowkey);
                }
                if(render){
                    keyValue = render(keyValue,rowdata,rowkey);
                }
                rowRecord.push(<td key={i + 2} style={style || tdStyle}>{keyValue}</td>);
            }
            rowRecords.push(<tr key={index} onDoubleClick={function(){self.handleRowClick(rowdata, self)}}>{rowRecord}</tr>);
        }
        return <tbody>{rowRecords}</tbody>;
    }
    
    initPagination(){
        var pagelist = <div/>;
        if(this.props.pagelist){
            var plist = this.props.pagelist;
            var plistdatas =[];
            for(var i in plist){
                plistdatas.push({key: plist[i] + " 条 / 每页", value:plist[i]});
            }
            pagelist = <Col style={{padding: 0, margin: "0 -15px 0 0"}} xs={2}><Selector datas={plistdatas} itemValue="value" itemLabel="key" onChange={this.handlePageSizeChange.bind(this)} defaultOpt/></Col>
        }

        var pagination = <div/>;
        if(!this.props.nopagination){
            pagination = <Col style={{padding: 0, margin: "-20px 0 0 -13px"}} xs={10}><PaginationBasic size={this.state.dataLength} page={this.state.pageNo} onPageChange={this.handlePageChange.bind(this)} per={this.state.pageSize}/></Col>;
        }
        
        return <Row>{pagelist}{pagination}</Row>;
    }
    
    render() {
        return (
            <div>
                <Table striped bordered condensed hover>
                    {this.initHeader()}
                    {this.initData()}
                </Table>
                {this.initPagination()}
            </div>
        )
    }
}

export default WcTable;