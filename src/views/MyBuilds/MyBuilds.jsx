import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BuildService from '@/services/BuildService';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { SectionLoader } from '@/components/ui/LoadingIndicator';
import BuildCard from './components/BuildCard';
import EmptyState from './components/EmptyState';
import LoginPrompt from './components/LoginPrompt';
import BuildsHeader from './components/BuildsHeader';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const MyBuilds = () => {
  const [builds, setBuilds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const buildsPerPage = 3; // Set to 3 for testing pagination
  const navigate = useNavigate();
  const { user } = useCart();

  useEffect(() => {
    loadBuilds();
  }, []);

  const loadBuilds = async () => {
    setIsLoading(true);
    try {
      const userBuilds = await BuildService.getUserBuilds();
      setBuilds(userBuilds);
    } catch (error) {
      toast.error('Failed to load builds', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (buildId, buildName) => {
    if (window.confirm(`Are you sure you want to delete "${buildName}"?`)) {
      setDeletingId(buildId);
      try {
        await BuildService.deleteBuild(buildId);
        toast.success('Build deleted successfully');
        loadBuilds();
      } catch (error) {
        toast.error('Failed to delete build', {
          description: error.message
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (build) => {
    navigate('/buildpc', { 
      state: { 
        loadBuild: build 
      } 
    });
  };

  const handleCreateNew = () => {
    navigate('/buildpc', { state: { clearDraft: true } });
  };

  const handleLogin = () => {
    navigate('/signin');
  };

  // Pagination logic
  const indexOfLastBuild = currentPage * buildsPerPage;
  const indexOfFirstBuild = indexOfLastBuild - buildsPerPage;
  const currentBuilds = builds.slice(indexOfFirstBuild, indexOfLastBuild);
  const totalPages = Math.ceil(builds.length / buildsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    let prev = 0;
    for (const i of range) {
      if (prev + 1 !== i) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  if (!user) {
    return <LoginPrompt onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <BuildsHeader onCreateNew={handleCreateNew} buildCount={builds.length} />

        {/* Loading State */}
        {isLoading ? (
          <SectionLoader message="Loading your builds..." />
        ) : builds.length === 0 ? (
          <EmptyState onCreateNew={handleCreateNew} />
        ) : (
          <>
            {/* Builds Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentBuilds.map((build) => (
                <BuildCard
                  key={build.id}
                  build={build}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === build.id}
                />
              ))}
            </div>

            {/* Pagination - Always visible */}
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={`transition-all duration-200 active:scale-95 ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}
                    />
                  </PaginationItem>

                  {getPaginationRange().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === '...' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer transition-all duration-200 active:scale-95 hover:bg-gray-100"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={`transition-all duration-200 active:scale-95 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyBuilds;
