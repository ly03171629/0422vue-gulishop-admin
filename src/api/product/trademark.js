import request from '@/utils/request'

export default {
  // DELETE /admin/product/baseTrademark/remove/{id}
  // 删除BaseTrademark
  delete(id){
    return request.delete(`/admin/product/baseTrademark/remove/${id}`)
  },


  // POST /admin/product/baseTrademark/save
  // 新增BaseTrademark
  // PUT /admin/product/baseTrademark/update
  // 修改BaseTrademark
  //添加和修改都需要传递一个请求体参数 这个请求体参数有id就代表修改  没有id就代表是添加

  addOrUpdate(trademark){
    if(trademark.id){
      return request.put('/admin/product/baseTrademark/update',trademark)
    }else{
      return request.post('/admin/product/baseTrademark/save',trademark)
    }
  },



  // GET /admin/product/baseTrademark/{page}/{limit}
  // 分页列表
  getPageList(page,limit){
    return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
  },


  //GET /admin/product/baseTrademark/getTrademarkList
  getList(){
    return request.get('/admin/product/baseTrademark/getTrademarkList')
  }

}

