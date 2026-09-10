import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import orderRoutes from './routes/order.routes.js';
import miscRoutes from './routes/misc.routes.js';
import adminRoutes from './routes/admin.routes.js';
import excelSyncRoutes from './routes/excel-sync.routes.js';
import googleSheetSyncRoutes from './routes/google-sheet-sync.routes.js';
import seoRoutes from './routes/seo.routes.js';
import { createSeoMiddleware } from './middleware/seoCrawlerMiddleware.js';
import { db } from './db/store.js';
import { pushProductToGoogleSheet } from './services/google-sheet.service.js';
export const app = express();
app.use(helmet({contentSecurityPolicy:false,crossOriginEmbedderPolicy:false,crossOriginResourcePolicy:false}));
app.use(cors({origin:true,credentials:true,methods:['GET','POST','PUT','DELETE','PATCH','OPTIONS']}));
app.options('*',cors({origin:true,credentials:true})); app.use(cookieParser());
app.use(express.json({limit:'10mb'})); app.use(express.urlencoded({extended:true,limit:'10mb'}));
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'Fumare Hookah API Server',timestamp:new Date().toISOString()}));
app.post('/api/translate',async(req,res)=>{const apiKey=process.env.GOOGLE_TRANSLATE_API_KEY;const {texts,target}=req.body as {texts?:unknown;target?:unknown};if(!Array.isArray(texts)||!texts.length||typeof target!=='string')return res.status(400).json({success:false,error:{code:'INVALID_TRANSLATION_REQUEST',message:'Provide texts array and a target language.'}});if(!apiKey)return res.json({success:true,data:texts});try{const input=texts.map(t=>String(t??''));const results:string[]=[];for(let i=0;i<input.length;i+=100){const batch=input.slice(i,i+100);const r=await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:batch,source:'en',target:target.toLowerCase(),format:'text'})});const p=await r.json() as any;if(!r.ok||!p.data?.translations)results.push(...batch);else results.push(...p.data.translations.map((x:any,j:number)=>x.translatedText||batch[j]));}return res.json({success:true,data:results});}catch{return res.json({success:true,data:texts});}});
app.get('/api/image-proxy',async(req,res)=>{const imageUrl=req.query.url as string;if(!imageUrl||(!imageUrl.startsWith('http://')&&!imageUrl.startsWith('https://')))return res.status(400).send('Invalid URL');try{const parsed=new URL(imageUrl);const r=await fetch(imageUrl,{headers:{'User-Agent':'Mozilla/5.0','Referer':`${parsed.origin}/`,'Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}});if(!r.ok)return res.status(r.status).send('Upstream image error');res.setHeader('Content-Type',r.headers.get('content-type')||'image/jpeg');res.setHeader('Cache-Control','public, max-age=86400, immutable');return res.send(Buffer.from(await r.arrayBuffer()));}catch{return res.status(502).send('Failed to fetch image');}});
app.use('/',seoRoutes); app.use(createSeoMiddleware());
app.use('/api/auth',authRoutes);app.use('/api/products',productRoutes);app.use('/api/cart',cartRoutes);app.use('/api/wishlist',wishlistRoutes);app.use('/api/orders',orderRoutes);app.use('/api/payments',orderRoutes);app.use('/api/admin',excelSyncRoutes);app.use('/api/admin',googleSheetSyncRoutes);
// Keep the admin dashboard and Google Sheet in sync. Product mutations are written to MongoDB by the existing route first, then mirrored to the Sheet before the response is sent.
app.use('/api/admin',async(req,res,next)=>{
  const isProductMutation = /^\/products(?:\/[^/]+)?$/.test(req.path) && ['POST','PUT','DELETE'].includes(req.method);
  if (!isProductMutation) return next();
  const originalJson = res.json.bind(res);
  (res as any).json = async (body:any) => {
    try {
      if (body?.success) {
        const id = (req.params as any)?.id || body?.data?.id;
        if (req.method === 'DELETE') {
          await pushProductToGoogleSheet('delete', { id });
        } else {
          const product = body?.data?.id ? body.data : (id ? db.products.find(p => p.id === id) : null);
          if (product) await pushProductToGoogleSheet('upsert', product);
        }
      }
    } catch (error) {
      console.warn('[Google Sheet] Admin mutation mirror notice:', error);
    }
    return originalJson(body);
  };
  next();
});
app.use('/api/admin',adminRoutes);app.use('/api',miscRoutes);
app.use('/api/*',(req,res)=>res.status(404).json({success:false,error:{code:'ROUTE_NOT_FOUND',message:`API endpoint '${req.method} ${req.baseUrl}' does not exist.`}}));
app.use((err:any,req:express.Request,res:express.Response,next:express.NextFunction)=>{console.error('[Server Error]',err);res.status(500).json({success:false,error:{code:'INTERNAL_SERVER_ERROR',message:err.message||'An unexpected error occurred on the server.'}});});
export default app;
