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
        let tpagesize = nopagination ? datas.length : (pagelist && pagelist.length > 0 ? parseInt(pagelist[0]) : pageSize);
        return tpagesize;
    }
    
    componentWillMount(){
        let { datas, method } = this.props;
        if(typeof datas === "string"){
            this.getDataByAjax(datas, method);
        }else{
            this.setState({datas: datas, dataLength: datas.length, pageSize: this.initPageSize(datas)});
        }
    }
    
    componentWillReceiveProps(nextProps){
        let datas = nextProps.datas;
        if(typeof datas === "string"){
            this.getDataByAjax(datas, nextProps.method);
        }else{
            let changed = _.isEqual(datas, this.state.datas);
            let tpagesize = this.initPageSize(datas);
            if(changed){
                this.setState({datas: datas, dataLength: datas.length, pageSize: tpagesize});
            }else{
                this.setState({datas: datas, dataLength: datas.length, pageSize: tpagesize, selectRows: [], checked: false});
            }
        }
    }
    
    getDataByAjax(url, method, pageNo, pageSize, sortHeader, sort){
        let self = this;
        method = method || "post";
        pageNo = pageNo || self.state.pageNo;
        pageSize = pageSize || (self.props.pagelist && self.props.pagelist.length > 0 ? parseInt(self.props.pagelist[0]) : self.state.pageSize);
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
        let datas = this.state.datas;
        let currentpage = currentPage || this.state.pageNo, pagesize = this.state.pageSize;
        let startIndex = pagesize * (currentpage - 1);
        return startIndex >= datas.length ? 0 : startIndex;
    }
    
    getEndIndex(currentPage){
        let datas = this.state.datas;
        let pagesize = this.state.pageSize;
        let endIndex = parseInt(this.getStartIndex(currentPage)) + parseInt(pagesize);
        return endIndex >= datas.length ? datas.length : endIndex;
    }
    
    getCurrentPageData(currentpage){
        let currentPage = currentpage || this.state.pageNo;
        let datas = this.state.datas;
        let startIndex = this.getStartIndex(currentPage), endIndex = this.getEndIndex(currentPage);
        let currentPageDatas = datas.slice(startIndex, endIndex);
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
        let pageSize = value;
        if(typeof this.props.datas === "string"){
            this.getDataByAjax(this.props.datas, this.props.method, 1, pageSize);
        }else{
            this.setState({pageSize:pageSize, checked: this.getAllCheckboxState(null, 1)});
        }
    }
    
    handleAllRowSelect(){
        let selecteds = this.state.selectRows, pkey = this.props.pkey;
        let currentPageDatas = this.getCurrentPageData();
        let checked = !this.state.checked;
        for(let i in currentPageDatas){
            let data = currentPageDatas[i];
            let index = pkey ? _.indexOf(selecteds, data[pkey].toString()) : _.findIndex(selecteds, data);
            let selected = pkey ? data[pkey].toString() : data;
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
        let selecteds = this.state.selectRows;
        let rowStr = row.target.value;
        let checked = row.target.checked;
        let pkey = this.props.pkey;
        let rowdata = pkey ? rowStr : JSON.parse(rowStr);
        selecteds = this.updateSelectRows(selecteds, rowdata, checked);
        let allchecked = this.getAllCheckboxState(selecteds);
        this.setState({selectRows: selecteds, checked: allchecked});
        this.props.onRowSelect(selecteds);
    }
    
    updateSelectRows(selecteds, select, add){
        let pkey = this.props.pkey;
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
        let currentPageDatas = this.getCurrentPageData(currentpage);
        let checked = currentPageDatas.length > 0;
        for(let i in currentPageDatas){
            let data = currentPageDatas[i];
            checked = this.getCurrentRowChecked(selectRows, data);
            if(!checked){
                break;
            }
        }
        return checked;
    }
    
    getCurrentRowChecked(selectRows, currentRow){
        let selecteds = selectRows || this.state.selectRows, pkey = this.props.pkey;
        return pkey ? (_.indexOf(selecteds, currentRow[pkey].toString()) >= 0) : (_.findIndex(selecteds, currentRow) >= 0);
    }
    
    handleHeaderClick(title, self){
        
        let sort = self.state.sort;
        let sortHeader = title;
        let sortHeaderDesc = sort[sortHeader] || false;
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
        let sort = this.state.sort;
        let sortHeader = this.state.sortHeader;
        let sortHeaderDesc = sort[sortHeader];
        
        let dA = dataA[sortHeader], dB = dataB[sortHeader];
        if(!dA || dA === undefined || dA == ""){dA = 0};
        if(!dB || dB === undefined || dB == ""){dB = 0};
        if(dA == dB){
            let pkey = this.props.pkey;
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
        let self = this;
        let rownumbers = self.props.rownumbers;
        let checkbox = self.props.checkbox;
        let headers = self.props.header;
        let descheader;
        
        // 定义表头样式
        let style = self.props.trStyle || {
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
        
        let tdStyle = self.props.tdStyle || {textAlign: "center"};
        
        if(headers.descheader){
            descheader = headers.descheader.map(function(hs, i){
                let header = [];
                if(rownumbers){
                    header.push(<th key={0}></th>);
                }
                if(checkbox){
                    header.push(<th key={1}></th>);
                }
                let ths = hs.map(function(h, j){
                    let colspan = h.colspan || 1;
                    let rowspan = h.rowspan || 1;
                    let title = h.title || "";
                    return <th key={j + 2} style={tdStyle} colSpan={colspan} rowSpan={rowspan}>{title}</th>;
                });
                header = header.concat(ths);
                return <tr key={i} style={style}>{header}</tr>;
            });
        }
        
        let dataheader = [];
        if(rownumbers){
            dataheader.push(<th key={0} style={tdStyle} width={30}></th>);
        }
        if(checkbox){
            dataheader.push(<th key={1} style={tdStyle} width={30}><input type='checkbox' key={"checkbox"} checked={self.state.checked} onChange={self.handleAllRowSelect.bind(self)}/></th>);
        }
        let header = headers.dataheader.map(function(h, k){
            let width = h.width || 100;
            if(h.sort){
                let sort = self.state.sort;
                let sortDesc = sort[h.key] || false;
                let sortIcon = sortDesc ? "↑" : "↓";
                return <th key={k + 2} style={tdStyle} width={width}><span onClick={function(){self.handleHeaderClick(h.key, self)}}>{h.title}</span>{sortIcon}</th>;
            }else{
                return <th key={k + 2} style={tdStyle} width={width}>{h.title}</th>;
            }
        });
        dataheader = dataheader.concat(header);
        let dataheadertr = <tr key={"dh"} style={style}>{dataheader}</tr>;
        style.fontSize = 12;
        return descheader ? (<thead>{descheader}{dataheadertr}</thead>) : (<thead>{dataheadertr}</thead>);
    }
    
    initData(){
        let self = this;
        let datas = self.state.datas;
        datas = self.state.sortHeader !== null ? datas.sort(self.dataSorter.bind(self)) : datas;
        let rownumbers = self.props.rownumbers;
        let checkbox = self.props.checkbox;
        let dataLength = datas.length, pkey = self.props.pkey;
        let dataheader = self.props.header.dataheader;
        
        let rowRecords = [];
        
        let tdStyle = self.props.tdStyle || {textAlign: "center"};
        
        for(let index = self.getStartIndex(), dataIndex = 1; index < self.getEndIndex(); index++, dataIndex++){
            let rowRecord = [], rowdata = datas[index], rowkey = pkey ? rowdata[pkey].toString() : undefined;
            if(rownumbers){
                rowRecord.push(<td key={0} style={tdStyle}>{ dataIndex }</td>);
            }
            if(checkbox){
                let checked = self.getCurrentRowChecked(null, rowdata);
                rowRecord.push(<th key={1} style={tdStyle}><input checked={checked} type='checkbox' value={rowkey || JSON.stringify(rowdata)} onChange={self.handleRowSelect.bind(self)}/></th>);
            }
            for(let i in dataheader){
                let key = dataheader[i].key;
                let keyValue = (key == "" || key == "--") ? "" : datas[index][key];
                let filter = dataheader[i].filter, render = dataheader[i].render, style = dataheader[i].style;
                if(filter){
                    keyValue = filter(keyValue,rowdata,rowkey);
                }
                if(render){
                    keyValue = render(keyValue,rowdata,rowkey);
                }
                rowRecord.push(<td key={i + 2} style={style || tdStyle}>{keyValue}</td>);
            }
            rowRecords.push(<tr key={dataIndex} onDoubleClick={function(){self.handleRowClick(rowdata, self)}}>{rowRecord}</tr>);
        }
        return <tbody>{rowRecords}</tbody>;
    }
    
    initPagination(){
        let pagelist = <div/>;
        if(this.props.pagelist){
            let plist = this.props.pagelist;
            let plistdatas =[];
            for(let i in plist){
                plistdatas.push({key: plist[i] + " 条 / 每页", value:plist[i]});
            }
            pagelist = <Col style={{padding: 0, margin: "0 -15px 0 0"}} xs={2}><Selector datas={plistdatas} itemValue="value" itemLabel="key" onChange={this.handlePageSizeChange.bind(this)} defaultOpt/></Col>
        }

        let pagination = <div/>;
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