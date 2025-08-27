#!/usr/bin/env node
/**
 * Git 백업 파일 정리 스크립트 (Node.js)
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('=== Git 백업 파일 정리 시작 ===');

const filesToRemove = [
    'src/pages/index_new.tsx',
    'src/pages/index_bak.tsx', 
    'src/pages/index_improved.tsx',
    'src/pages/search_0824.tsx',
    'src/pages/trending_backup.tsx',
    'src/pages/trending_old.tsx',
    'src/pages/track/_backup_artistId.tsx',
    'src/pages/trending/index.tsx.backup',
    'BACKUP_TEMP/'
];

filesToRemove.forEach(file => {
    try {
        // Git에서 파일이 추적 중인지 확인
        execSync(`git ls-files --error-unmatch "${file}"`, { stdio: 'ignore' });
        
        // 추적 중이면 삭제
        console.log(`Removing from Git: ${file}`);
        execSync(`git rm -r "${file}"`, { stdio: 'ignore' });
    } catch (e) {
        console.log(`Not tracked or already removed: ${file}`);
    }
});

try {
    // 모든 변경사항 스테이징
    execSync('git add .', { stdio: 'inherit' });
    
    // 상태 확인
    console.log('\n=== Git Status ===');
    execSync('git status', { stdio: 'inherit' });
    
    console.log('\n=== 다음 명령어를 실행하세요 ===');
    console.log('git commit -m "Remove backup files to fix NextJS routing conflicts"');
    console.log('git push');
    
} catch (e) {
    console.error('Git 명령 실행 실패:', e.message);
}
