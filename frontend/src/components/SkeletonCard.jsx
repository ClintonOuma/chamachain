export default function SkeletonCard({ height = 120, style = {} }) { 
   return ( 
     <div style={{ 
       height, 
       borderRadius: '20px', 
       background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)', 
       backgroundSize: '200% 100%', 
       animation: 'shimmer 1.5s infinite', 
       border: '1px solid rgba(255,255,255,0.06)', 
       ...style 
     }} /> 
   ) 
 } 
