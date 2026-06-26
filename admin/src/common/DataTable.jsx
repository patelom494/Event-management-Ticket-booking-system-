import React, { useState } from "react";
export default function DataTable({ title, columns, data, loading, searchKeys=[], renderRow, headerAction, emptyMessage="No data found" }) {
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1); const perPage=7;
  const filtered=data.filter((item)=>searchKeys.some((key)=>{let v=item;for(const k of key.split("."))v=v?.[k];return String(v||"").toLowerCase().includes(search.toLowerCase());}));
  const totalPages=Math.max(1,Math.ceil(filtered.length/perPage));const start=(page-1)*perPage;const rows=filtered.slice(start,start+perPage);
  return (
    <div className="card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <h5 className="mb-0">{title}</h5>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <div className="input-group" style={{maxWidth:200}}>
            <span className="input-group-text"><i className="bx bx-search"/></span>
            <input type="text" className="form-control" placeholder="Search..." value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}}/>
          </div>
          {headerAction}
        </div>
      </div>
      <div className="card-body p-0"><div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light"><tr><th style={{width:50}}>#</th>{columns.map((c)=><th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {loading?(<tr><td colSpan={columns.length+1} className="text-center py-5"><div className="spinner-border text-primary" style={{width:28,height:28}}/><p className="mt-2 text-muted mb-0">Loading...</p></td></tr>)
            :rows.length===0?(<tr><td colSpan={columns.length+1} className="text-center py-5"><i className="bx bx-search-alt" style={{fontSize:36,color:"#ccc"}}/><p className="mt-2 text-muted mb-0">{emptyMessage}</p></td></tr>)
            :rows.map((item,i)=>renderRow(item,start+i+1))}
          </tbody>
        </table>
      </div></div>
      {!loading&&filtered.length>0&&(
        <div className="card-footer d-flex justify-content-between align-items-center flex-wrap gap-2">
          <small className="text-muted">Showing {start+1}–{Math.min(start+perPage,filtered.length)} of {filtered.length}</small>
          <ul className="pagination mb-0 pagination-sm">
            <li className={`page-item ${page===1?"disabled":""}`}><button className="page-link" onClick={()=>setPage(page-1)}><i className="bx bx-chevron-left"/></button></li>
            {[...Array(totalPages)].map((_,i)=><li key={i+1} className={`page-item ${page===i+1?"active":""}`}><button className="page-link" onClick={()=>setPage(i+1)}>{i+1}</button></li>)}
            <li className={`page-item ${page===totalPages?"disabled":""}`}><button className="page-link" onClick={()=>setPage(page+1)}><i className="bx bx-chevron-right"/></button></li>
          </ul>
        </div>
      )}
    </div>
  );
}
